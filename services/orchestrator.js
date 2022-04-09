const configuration = require('../config/config-nonRestricted.js')
const helper = require('./helper.js')
const EventEmitter = require('events')
const generalCtrl = require('../controllers/generalCtrl.js')
const blklistProvider = require("../models/BlklistProvider")
const blklistResponse = require("../models/ResponseBlklist")
const { onPremiseChangeTestFile } = require('../controllers/testingCtrl.js')
const compGen = require('../controllers/graphs/compGen.js')
const topGen = require('../controllers/graphs/topGen.js')
const mapGen = require('../controllers/maps/mapGen.js')
const { onEventRun } = require('./workers/top.js')
const { getState, setFree, setFreeAfterTime } = require('../controllers/generalCtrl.js')
const { isCacheUsable, setCacheBloklistResponses, setCacheBloklistProviders, getCachedBloklistProviders, getCachedBloklistResponses } = require('../services/cacheFile.js')
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
    
    // setInterval( () => {
    //     eventEmitter.emit(configuration.EVENT_TEST);
    // }, configuration.TIMER_EVENT_TEST) 
    
    

    /* spracuj source event */
    eventEmitter.on(configuration.EVENT_SOURCES, async () => {
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
            var tmp = await blklistResponse.find({})
            setCacheBloklistResponses(tmp)

            tmp = cachedBloklistProviders = await blklistProvider.find({})
            setCacheBloklistProviders(tmp)
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(6)
            console.log("Freed SOURCE")
        }
    });



    /* spracuj graph event */
    eventEmitter.on(configuration.EVENT_GRAPH, async () => {
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
                var tmp1 = getCachedBloklistProviders()
                var tmp2 = getCachedBloklistResponses()
                await compGen.onEventGenerateFiles(tmp1, tmp2);
                await topGen.onEventGenerateFiles(tmp1, tmp2);
            } else {
                console.log("Data for compGen and topGen not ready yet")
            }
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(4)
            console.log("Freed GRAPH")
        }
    });
    
    /* spracuj map event */
    eventEmitter.on(configuration.EVENT_MAPS, async () => {
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
                var tmp1 = getCachedBloklistProviders()
                var tmp2 = getCachedBloklistResponses()
                await mapGen.onEventGenerateFiles(tmp1, tmp2);
                console.log('here we are')
            } else {
                console.log("Data for mapGen not ready yet")
            }
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            await generalCtrl.setFree(5)
            console.log("Freed MAPS")
        }
    });
    
    eventEmitter.on(configuration.EVENT_TEST, async () => {
        // set max time block
        if ((await generalCtrl.getState(2)).isBusy === 0) {
            await generalCtrl.setBusyFor(2, configuration.BLOCK_TIME_ANALYSIS)
            await generalCtrl.simulateWorkAndThenSetIdle(2, 1)
        } else {
            console.log("Event TEST NOT raised. Consider increasing period for tests.")
            return
        }

        // Work
        console.log(`Event TEST raised on: ${helper.date_plus_time()}`);

        onPremiseChangeTestFile()

        try {
            await onEventRun()
        } catch (e) {
            helper.logError(`Error: ${e}`)
        } finally {
            console.log("Test finished, freeing")
            await generalCtrl.setFree(2)
            console.log("Freed TEST")
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
