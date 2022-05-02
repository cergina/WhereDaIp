const configuration = require('../config/config-nonRestricted.js')
const helper = require('./helper.js')
const EventEmitter = require('events')
const generalCtrl = require('../controllers/generalCtrl.js')
const ipsCtrl = require('../controllers/ipsCtrl.js')
const blklistProvider = require("../models/BlklistProvider")
const blklistResponse = require("../models/ResponseBlklist")
const { onPremiseChangeTestFile } = require('../controllers/testingCtrl.js')
const compGen = require('../controllers/graphs/compGen.js')
const topGen = require('../controllers/graphs/topGen.js')
const mapGen = require('../controllers/maps/mapGen.js')
const { onEventRun } = require('./workers/top.js')
const { getState, setFree, setFreeAfterTime } = require('../controllers/generalCtrl.js')
const { isCacheUsable, setCacheBloklistResponses, setCacheBloklistProviders, getCachedBloklistProviders, getCachedBloklistResponses, 
    setCacheGeolocatedIps, getAllCache, calculateUniqueGeolocatedIps, setCacheUniqueGeolocatedIps } = require('../services/cacheFile.js')
const actionSaver = require('../services/actionSaver.js')
const reqFile = require('./requestsFile.js')
const eventEmitter = new EventEmitter()



const setUp = () => { 
    /* vyhadzovanie eventov */
    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_SOURCES);
    }, configuration.TIMER_EVENT_SOURCES) 

    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_GRAPH);
    }, configuration.TIMER_EVENT_GRAPH)
    
    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_MAPS);
    }, configuration.TIMER_EVENT_MAPS)

    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_GEOLOCATION);
    }, configuration.TIMER_EVENT_GEOLOCATION)
    

    /* spracuj GEOLOCATION event */
    reqFile.setGeolocationLimit()

    eventEmitter.on(configuration.EVENT_GEOLOCATION, async () => {
        // set max time block
        var actualState = await generalCtrl.getState(2)
        var batchesLeft = await reqFile.getLimitAndBatchCount()
        var isLast = undefined
        
        if (actualState.isBusy === 0 && batchesLeft.batchesCount > 0) {
            await generalCtrl.setBusyFor(2, configuration.BLOCK_TIME_GEOLOCATION)
            await generalCtrl.simulateWorkAndThenSetIdle(2, configuration.BLOCK_TIME_GEOLOCATION)
            
            if (batchesLeft.batchesCount === 1)
                isLast = true
        } else if (actualState.isBusy === 0 && batchesLeft.batchesCount === 0) {
            console.log("Event GEOLOCATION NOT raised. Nothing to do.")
            return 
        } else {
            console.log("Event GEOLOCATION NOT raised. Consider increasing period for source caching.")
            return 
        }

        // Work
        console.log(`Event GEOLOCATION raised on: ${helper.date_plus_time()}`);
        
        try {
            // pop one array from requestsFile
            // geolocate both
            // save as subnet - with inner IPs
            var whatToDo = await reqFile.popOneBatch()


            if (whatToDo !== null) { 
                // geolocate
                console.log(`Now we do: \n${whatToDo}`)

                await ipsCtrl.searchForIpsController(whatToDo, isLast)
            } else {
                console.log('Nothing to do now') 
            }
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            console.log("Event GEOLOCATION done, but new jobs will not be available straightaway")
        }
    });

    /* spracuj SOURCE event */
    eventEmitter.on(configuration.EVENT_SOURCES, async () => {
        if (actionSaver.isRequiredToCalcSources() === false) {
            console.log(`Cache does not have to be refreshed.`)
            return
        }

        // set max time block
        if ((await generalCtrl.getState(6)).isBusy === 0) {
            await generalCtrl.setBusyFor(6, configuration.BLOCK_TIME_SOURCES)
            await generalCtrl.simulateWorkAndThenSetIdle(6, 1)
        } else {
            console.log("Event SOURCE NOT raised. Consider increasing period for source caching.")
            return
        }

        // Work
        console.log(`Event SOURCE raised on: ${helper.date_plus_time()}`);
        
        try {
            // na zaciatok fakt staci cache na bloklisty, tych je vela
            var resps = await blklistResponse.find({})
            var provs = await blklistProvider.find({})
            var ips = await ipsCtrl.getAllGeolocatedIps()
            
            setCacheBloklistResponses(resps)
            setCacheBloklistProviders(provs)
            setCacheGeolocatedIps(ips)
            
            var uips = await calculateUniqueGeolocatedIps()
            setCacheUniqueGeolocatedIps(uips)
            
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(6)
            console.log("Freed SOURCE")
            actionSaver.cacheDone()
        }
    });



    /* spracuj GRAPH event */
    eventEmitter.on(configuration.EVENT_GRAPH, async () => {
        if (actionSaver.isRequiredToCalcGraphs() === false) {
            console.log(`Graphs do not have to be refreshed.`)
            return
        }

        // set max time block
        if ((await generalCtrl.getState(4)).isBusy === 0) {
            await generalCtrl.setBusyFor(4, configuration.BLOCK_TIME_GRAPHS)
            await generalCtrl.simulateWorkAndThenSetIdle(4, 1)
        } else {
            console.log("Event GRAPH NOT raised. Consider increasing period for graphs generation.")
            return
        }

        // Work
        console.log(`Event GRAPH raised on: ${helper.date_plus_time()}`);
        
        try {
            if (isCacheUsable()) {
                var cached = getAllCache()

                await compGen.onEventGenerateFiles(cached);
                await topGen.onEventGenerateFiles(cached);
                await onEventRun()  // topTags.json
            } else {
                console.log("Data for compGen and topGen not ready yet")
            }
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(4)
            console.log("Freed GRAPH")
            actionSaver.graphsDone()
        }
    });
    
    /* spracuj MAPS event */
    eventEmitter.on(configuration.EVENT_MAPS, async () => {
        if (actionSaver.isRequiredToCalcMaps() === false) {
            console.log(`Maps do not have to be refreshed.`)
            return
        }

        // set max time block
        if ((await generalCtrl.getState(5)).isBusy === 0) {
            await generalCtrl.setBusyFor(5, configuration.BLOCK_TIME_MAPS)
            await generalCtrl.simulateWorkAndThenSetIdle(5, 1)
        } else {
            console.log("Event MAPS NOT raised. Consider increasing period for maps generation.")
            return
        }
        
        // Work
        console.log(`Event MAPS raised on: ${helper.date_plus_time()}`);

        try {
            if (isCacheUsable()) {
                var cached = getAllCache()
                await mapGen.onEventGenerateFiles(cached);
            } else {
                console.log("Data for mapGen not ready yet")
            }
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(5)
            console.log("Freed MAPS")
            actionSaver.mapsDone()
        }
    });
    
}

// freeing of sources, graphs and maps is safe
// never free geolocation
const setTasksIdleNowOrDoSoWhenTimeExpired = async (req, res) => {
    // MAX EVENT NUMBER + 1: found when max was 6 and max X would be 5
    for (const x of Array(7).keys()) {
        var tempState = await getState(x)
        var tempCas = (new Date(tempState.expectedEndAt)).getTime()
        
        if (tempState.isBusy === 1) {
            // nastav na IDLE, lebo cas prekroceny
            if (tempCas <= Date.now()) {
                await setFree(x)
            }
            // nastav FREE na graphs, maps a sources
            else if (x === 3 || x === 4 || x === 5 || x === 6) {
                await setFree(x)
            }
            // nastav kedy nastavi na IDLE
            else {
                await setFreeAfterTime(x, tempCas - Date.now())
            }
        } 
    }
    
}

module.exports = {
    setUp, setTasksIdleNowOrDoSoWhenTimeExpired
}
