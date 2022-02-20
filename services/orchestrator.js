const configuration = require('../config/config-nonRestricted.js')
const { date_plus_time } = require('./helper.js')
const EventEmitter = require('events')
const { onPremiseChangeTestFile } = require('../controllers/testingCtrl.js')
const { onEventRun } = require('./workers/top.js')
const eventEmitter = new EventEmitter()


const setUp = (req, res) => {
    // setInterval( () => {
    //     eventEmitter.emit(configuration.EVENT_GRAPH);
    // }, configuration.TIMER_EVENT_GRAPH)
    
    // setInterval( () => {
    //     eventEmitter.emit(configuration.EVENT_MAPS);
    // }, configuration.TIMER_EVENT_MAPS)
    
    setInterval( () => {
        eventEmitter.emit(configuration.EVENT_TEST);
    }, configuration.TIMER_EVENT_TEST)
    
    
    eventEmitter.on(configuration.EVENT_GRAPH, () => {
        console.log(`Event GRAPH raised on: ${date_plus_time()}`);
    });
    
    eventEmitter.on(configuration.EVENT_MAPS, () => {
        console.log(`Event MAPS raised on: ${date_plus_time()}`);
    });
    
    eventEmitter.on(configuration.EVENT_TEST, async () => {
        console.log(`Event TEST raised on: ${date_plus_time()}`);
        onPremiseChangeTestFile()
        try {
            await onEventRun()
        } catch (e) {

        }
    });
}



module.exports = {
    setUp
}
