const configuration = require('../config/config-nonRestricted.js')
const helper = require('./helper.js')
const EventEmitter = require('events')
const { onPremiseChangeTestFile } = require('../controllers/testingCtrl.js')
const compGen = require('../controllers/graphs/compGen.js')
const topGen = require('../controllers/graphs/topGen.js')
const mapGen = require('../controllers/maps/mapGen.js')
const { onEventRun } = require('./workers/top.js')
const { getState, setFree, setFreeAfterTime } = require('../controllers/generalCtrl.js')
const eventEmitter = new EventEmitter()


const setUp = (req, res) => {
    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_GRAPH);
    }, configuration.TIMER_EVENT_GRAPH)
    
    // setInterval( () => {
    //     eventEmitter.emit(configuration.EVENT_MAPS);
    // }, configuration.TIMER_EVENT_MAPS)
    
    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_TEST);
    }, configuration.TIMER_EVENT_TEST)
    
    
    eventEmitter.on(configuration.EVENT_GRAPH, async () => {
        console.log(`Event GRAPH raised on: ${helper.date_plus_time()}`);
        
        try {
            await compGen.onEventGenerateFiles();
            await topGen.onEventGenerateFiles();
        } catch (e) {
            helper.logError(`Error: ${e}`)
        }
    });
    
    eventEmitter.on(configuration.EVENT_MAPS, async () => {
        console.log(`Event MAPS raised on: ${helper.date_plus_time()}`);

        try {
            await mapGen.onEventGenerateFiles();
        } catch (e) {
            helper.logError(`Error: ${e}`)
        }
    });
    
    eventEmitter.on(configuration.EVENT_TEST, async () => {
        console.log(`Event TEST raised on: ${helper.date_plus_time()}`);

        onPremiseChangeTestFile()

        try {
            await onEventRun()
        } catch (e) {
            helper.logError(`Error: ${e}`)
        }
    });
}

const setTasksIdleNowOrDoSoWhenTimeExpired = async (req, res) => {
    for (const x of Array(5).keys()) {
        var tempState = await getState(x)
        var tempCas = (new Date(tempState.expectedEndAt)).getTime()
        
        if (tempState.isBusy === 1) {
            // nastav na IDLE, lebo cas prekroceny
            if (tempCas <= Date.now()) {
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
