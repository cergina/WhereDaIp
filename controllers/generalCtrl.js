// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')
const stateProvider = require('../models/stateProvider.js')
const basePath = `basic/`


// just for / to show basic redirects, possibly some info later
const welcome = (req, res) => {
    res.render('index.ejs', { name: configuration.USER, siteTitle: 'Home page', startedAt: configuration.STARTEDAT})
}
const state = async (req, res) => {
    var state = {}
    
    state.analyse = await getState(3)
    state.geoloc = await getState(2)

    res.render(`${basePath}state.ejs`, { name: configuration.USER, siteTitle: 'APP state', startedAt: configuration.STARTEDAT, 
        state: state
    })
}
const geolocation = (req, res) => {
    res.render(`${basePath}geolocation.ejs`, { siteTitle: 'Geolocation'})
}
const presentation = (req, res) => {
    res.render(`${basePath}presentation.ejs`, { siteTitle: 'Presentation'})
}
const faq = (req, res) => {
    res.render(`${basePath}faq.ejs`, { siteTitle: 'FAQ'})
}

// public
const setBusyFor = async (arg, howManyMinutes) => {
    // general is 0
    // test is 1
    // geolocation is 2
    // analyse is 3
    var retState = await stateProvider.findOne({ type : arg })

    if (retState === null) {
        retState = new stateProvider()
    }
    
    retState.isBusy = 1
    retState.startedAt = new Date()
    retState.expectedEndAt = new Date(Date.now() + howManyMinutes * 60000)

    try {
        retState.save()
    } catch (e) {
        console.log(e)
    }
}

const simulateWorkAndThenSetIdle = async (arg, howManyMinutes) => {
    console.log("Simulating work - started")

    setTimeout(async function() {
        // general is 0
        // test is 1
        // geolocation is 2
        // analyse is 3
        var retState = await stateProvider.findOne({ type : arg })

        if (retState === null) {
            retState = new stateProvider()
        }

        retState.isBusy = 0
        retState.expectedEndAt = new Date()

        try {
            retState.save()
        } catch (e) {
            console.log(e)
        }

        console.log("Simulating work - FINISHED")
    }, howManyMinutes * 60000)

    console.log("Simulating work - planned")
}

// general
const getState = async (arg) => {
    // general is 0
    // test is 1
    // geolocation is 2
    // analyse is 3
    var retState = await stateProvider.findOne({ type : arg })

    if (retState === null) {
        retState = new stateProvider()
    }

    // return phase
    var obj = {}

    obj.startedAt = retState.startedAt
    obj.expectedEndAt = retState.expectedEndAt
    obj.isBusy = retState.isBusy

    return obj
}



module.exports = {
    welcome, state, geolocation, presentation, faq,
    setBusyFor, getState, simulateWorkAndThenSetIdle
}
