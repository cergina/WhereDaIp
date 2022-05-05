// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')
const stateProvider = require('../models/stateProvider.js')
const basePath = `basic/`
const { getLimitAndBatchCount, setGeolocationLimit } = require('../services/requestsFile.js')


// just for / to show basic redirects, possibly some info later
const welcome = (req, res) => {
    res.render('index.ejs', { name: configuration.USER, siteTitle: 'Home page', startedAt: configuration.STARTEDAT})
}
const state = async (req, res) => {
    var state = {}
    
    state.analyse = await getState(3)
    state.geoloc = await getState(2)
    state.graphs = await getState(4)
    state.maps = await getState(5)
    state.sources = await getState(6)

    await setGeolocationLimit()
    var geo = await getLimitAndBatchCount()
    state.geoloc.batchesCount = geo.batchesCount
    state.geoloc.currentLimit = geo.currentLimit
    state.fieldsMissing = geo.fieldsMissing

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
    // graph analysis is 4
    // maps analysis is 5
    var retState = await stateProvider.findOne({ type : arg })

    if (retState === null) {
        retState = new stateProvider()
        retState.type = arg
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

const setFree = async (arg) => {
    // general is 0
    // test is 1
    // geolocation is 2
    // analyse is 3
    // graph analysis is 4
    // maps analysis is 5
    var retState = await stateProvider.findOne({ type : arg })

    if (retState === null) {
        retState = new stateProvider()
        retState.type = arg
    }
    
    retState.isBusy = 0
    retState.expectedEndAt = Date.now()

    try {
        retState.save()
    } catch (e) {
        console.log(e)
    }
}

const setFreeAfterTime = async (arg, milis) =>  {
    setTimeout(async function() {
        var retState = await stateProvider.findOne({ type : arg })

        if (retState === null) {
            retState = new stateProvider()
            retState.type = arg
        }

        if (retState.isBusy === 1) 
            retState.expectedEndAt = new Date()
        retState.isBusy = 0

        try {
            retState.save()
        } catch (e) {
            console.log(e)
        }
    }, milis)
}

const simulateWorkAndThenSetIdle = async (arg, howManyMinutes) => {
    //console.log("Simulating work - started")

    setTimeout(async function() {
        // general is 0
        // test is 1
        // geolocation is 2
        // analyse is 3
        // graph analysis is 4
        // maps analysis is 5
        var retState = await stateProvider.findOne({ type : arg })

        if (retState === null) {
            retState = new stateProvider()
            retState.type = arg
        }

        //console.log(`simulate finishing ${retState}`)
        if (retState.isBusy === 1) 
            retState.expectedEndAt = new Date()
        retState.isBusy = 0

        try {
            retState.save()
        } catch (e) {
            console.log(e)
        }

        //console.log("Simulating work - FINISHED")
    }, howManyMinutes * 60000)

    //console.log("Simulating work - planned")
}

// general
const getState = async (arg) => {
    // general is 0
    // test is 1
    // geolocation is 2
    // analyse is 3
    // graph analysis is 4
    // maps analysis is 5
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
    setBusyFor, getState, simulateWorkAndThenSetIdle, setFree, setFreeAfterTime
}
