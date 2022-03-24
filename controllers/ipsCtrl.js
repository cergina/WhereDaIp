// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require('../config/config-nonRestricted.js')
const responseData = require("../models/responseData")
const net = require('net')
const { getAllUsableProviders } = require('./providersCtrl.js')
const generalCtrl = require('./generalCtrl.js')
const covertCtrl = require('./covertCtrl.js')
const suspectCtrl = require('./suspectCtrl.js')
const blklistCtrl = require('./blklistCtrl.js')
const { logDebug, logError, yyyymmdd } = require('../services/helper.js')
const { sendPromise, sendFakePromise } = require('../services/apiCommunicator.js')
const locationProvider = require('../models/locationProvider.js')

const basePath = `requests/`

// GETs
const showAllIps = async (req, res) => {
    const requests = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "city": 1,
        "country": 1,
        "provider": 1
    }).sort({ addedAt: 'desc'})

    // not optimized
    //const requests = await responseData.find().sort({ addedAt: 'desc'})
        
    const providers = await locationProvider.find()

    // create shortened json to send to frontend 
    var customizedProviders = {}

    for (var i in providers) 
    {
        var item = { name: providers[i].name, slug: providers[i].slug, _id: providers[i]._id }
        customizedProviders[providers[i]._id] = item
    }

    res.render(`${basePath}ips.ejs`, { requests: requests, 
        providers: customizedProviders,
        siteTitle: 'List of IPs'})
}

const showFilteredIps = async (req, res) => {
    const requests = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "city": 1,
        "country": 1,
        "provider": 1
    }).sort({ addedAt: 'desc'})

    // not optimized
    // const requests = await responseData.find().sort({ addedAt: 'desc'})
    
    const providers = await locationProvider.find()
    
    // create shortened json to send to frontend 
    var customizedProviders = {}

    for (var i in providers) 
    {
        var item = { name: providers[i].name, slug: providers[i].slug, _id: providers[i]._id }
        customizedProviders[providers[i]._id] = item
    }
    
    // create summed Up request to show in list
    var summedRequests = []

    for (var i in requests) {
        if (summedRequests.some(item => item.ipRequested === requests[i].ipRequested))
            continue

        var item = 
        {
            success: requests[i].success,
            ipRequested: requests[i].ipRequested,
            firstAddedAt: requests[i].addedAt,
            lastAddedAt: requests[i].addedAt,
            city: requests[i].city,
            country: requests[i].country
        }

        summedRequests.push(item)
    }

    res.render(`${basePath}filteredIps.ejs`, { summedRequests: summedRequests, 
        providers: customizedProviders,
        siteTitle: 'Fused IP information'})
}

const showTestMap = (req, res) => {
    res.render(`${basePath}mapTest.ejs`)
}

const downloadResponses = async (req, res) => {
    console.log('Downloading responses')

    // make sure to know when was it downloaded
    const date = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}

    var text = "WhereDaIp - responses extraction\r\n"
    text += `Downloaded at: ${date.toLocaleDateString(undefined, options)}\r\n\r\n`
    const requests = await responseData.find().sort({ addedAt: 'desc'})
    text += JSON.stringify(requests)
    text += '\r\n'


    // name the file accordingly
    res.attachment(`WDP-Responses-${yyyymmdd()}.txt`)
    res.type('txt')
    res.send(text)
}

const analyseIps = async (req, res) => {
    // block for one minute
    if ((await generalCtrl.getState(3)).isBusy === 0) {
        await generalCtrl.setBusyFor(3, 1)
        await generalCtrl.simulateWorkAndThenSetIdle(3, 1)
    } else {
        console.log("Analyse is already occupied")
        res.redirect('/state')
        return
    }

    // just test
    res.redirect('/state')

    console.log('test')

    // let's analyze
    var responses = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "findings": 1
    }).sort({ ipRequested: 'asc'})


    var covFindings = await covertCtrl.reportFindingsHere(responses)
    var blkFindings = await blklistCtrl.reportFindingsHere(responses)
    var susFindings = await suspectCtrl.reportFindingsHere(responses)

    /* mame findingy. teraz ich treba priradit ku kazdemu response.findings arrayu */
    try {
        for (var x of responses) {

            x.findings = []

            // sus
            for (var s of susFindings) {
                if (x.ipRequested === s.ipRequested) {
                    x.findings.push({text: s.text, foundAt: s.foundAt})
                }
            }

            console.log('test middle')

            //TODO
            // cov
            for (var c of covFindings) {
                if (x.ipRequested === c.ipRequested) {
                    x.findings.push({text: c.text, foundAt: c.foundAt})
                }
            } 

            //TODO
            // blk
            for (var b of blkFindings) {
                if (x.ipRequested === b.ipRequested) {
                    x.findings.push({text: b.text, foundAt: b.foundAt})
                }
            }

            x.save()
        }
    } catch(e) {
        console.log(e)
    } finally {
        //await generalCtrl.setFree(3, 1)
    }

    console.log('test end')
    await generalCtrl.setFree(3)
    console.log('test freed')
    
}


const makeRequestController = (req, res) => {
    res.render(`${basePath}makeRequest.ejs`, { siteTitle: 'New request'})
}

/* this needs to contain fused data and providers array, low chance of some fields being empty */
const showFusedResponse = async (req, res) => {
    /* make sure at least one response is found */
    const response = await responseData.findOne({ ipRequested : req.params.ipRequested })

    if (response == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    /* get all providers */
    const providers = await locationProvider.find()
    
    // create shortened json to send to frontend 
    var customizedProviders = {}

    for (var i in providers) 
    {
        var item = { name: providers[i].name, date: response.addedAt, slug: providers[i].slug, _id: providers[i]._id }

        var dataForThisProvider = await responseData.findOne({ ipRequested: req.params.ipRequested, provider: providers[i]._id })
        
        if (typeof dataForThisProvider === 'undefined')
            continue

        item.data = dataForThisProvider

        customizedProviders[providers[i]._id] = item
    }

    // console.log(customizedProviders + '\nhaha\n')
    
    // for(var a in customizedProviders) {
    //     console.log(a)
    //     console.log(customizedProviders[a])
    //     console.log('ende\n')
    // }

    res.render(`${basePath}showFusedResponse.ejs`, {
        response: response, // only used for general info
        providers: customizedProviders, 
        siteTitle: 'Fused Response'})
}

/* specific response from specific provider, some fields will surely be empty */
const showResponse = async (req, res) => {
    const response = await responseData.findById(req.params.id)

    if (response == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    const provider = await locationProvider.findById(response.provider)

    res.render(`${basePath}showResponse.ejs`, { response: response, provider: provider, siteTitle: 'Response details' })
}


// POSTs
const deleteExistingResponse = async (req, res) => {
    await responseData.findByIdAndDelete(req.params.id)
    res.redirect(`${configuration.WWW_REQ_HOME}`)
}

const acceptRequestController = async (req, res) => {

    if (configuration.PASS !== req.body.password_for_lookup) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?unauthorized=1`)
        return
    }

    //logInfo('I will look onto it')

    // TODO it's necessarry to clear \r\n, maybe on linux it will be only \n, will have to test
    var addresses = req.body.ip_addresses_to_lookup.split("\r\n").filter(item => item)

    //logDebug(addresses)
    
    // supports IPv4 and IPv6, but accepts only minimal like 192.168.0.1 and no 192.168.0.001
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?invalid=1`)
        return
    }
    
    try {
        var providers = await getAllUsableProviders()

        // for every address send
        addresses.forEach(address => {
            logDebug(providers)
            providers.forEach(provider => {
                sendPromise(address, provider) // this one is real
                //sendFakePromise(address, provider)
                    .then(async res => {
                        logDebug(res)

                        let extractedData = extractDataFromResponse(address, res, provider)

                        await extractedData.save()
                    })
                    .catch(err => logError(err))
            })
        })

        // this needs to be done differently because sometimes there can be more requests and the time will not be enough
        setTimeout(function() {
            res.redirect(`${configuration.WWW_REQ_HOME}`);
        }, 500)
    } catch (e) {
        logError(e)
    }
}


// PRIVATE

function extractDataFromResponse(address, originalResponse, provider) {
    let extractedData = new responseData()

    // console.log('kluce su')
    // console.log(Object.keys(originalResponse))
    //console.log(provider.response.continentPath)

    // success, type, country, city, latitude, longitude, isp is necessary
    extractedData.ipRequested = address
    extractedData.addedAt = new Date()
    extractedData.provider = provider._id
    extractedData.type = net.isIPv4(address) ? 0 : 1
    
    if (provider.format === 0) {
        // json
        extractedData = extractFromJSON(extractedData, originalResponse, provider)
    } else if (provider.format === 1) {
        // xml not implemented yet
        extractedData = extractFromXML(extractedData, originalResponse, provider)
    }
    

    return extractedData
}

function extractFromJSON(extractedData, originalResponse, provider) {
    // TODO
    // this will work only in json and also when every field is filled
    
    // sometimes response is true, false, 0, 1 thats ok
    // but sometimes its 'success' 'fail' and that has to be handled
    let tmpVar = originalResponse[provider.response.successPath]

    if (tmpVar === 'true' || tmpVar === true || tmpVar === 'success' || tmpVar === 1)
        extractedData.success = 1
    else
        extractedData.success = 0
    
    //logInfo(`hlasim: ${extractedData.success} lebo '${provider.response.successPath}'  '${originalResponse[provider.response.successPath]}'`)
    
    extractedData.continent = originalResponse[provider.response.continentPath]
    extractedData.country = originalResponse[provider.response.countryPath]
    extractedData.countryCode = originalResponse[provider.response.countryCodePath]
    extractedData.countryFlag = originalResponse[provider.response.countryFlagPath]
    extractedData.region = originalResponse[provider.response.regionPath]
    extractedData.city = originalResponse[provider.response.cityPath]
    extractedData.latitude = originalResponse[provider.response.latitudePath]
    extractedData.longitude = originalResponse[provider.response.longitudePath]
    extractedData.org = originalResponse[provider.response.orgPath]
    extractedData.isp = originalResponse[provider.response.ispPath]
    extractedData.currency = originalResponse[provider.response.currencyPath]

    // only in ip-api (for now)
    extractedData.as = originalResponse[provider.response.asPath]
    extractedData.mobile = originalResponse[provider.response.mobilePath]
    extractedData.proxy = originalResponse[provider.response.proxyPath]
    extractedData.hosting = originalResponse[provider.response.hostingPath]

    return extractedData
}

function extractFromXML(extractedData, originalResponse, provider) {
    // success, type, country, city, latitude, longitude, isp is necessary
    
    // TODO - not implemented yet

    return extractedData
}


// For EVENTS
const getJsonWithCountedOrigin = async (req, res) => {
    // we want same country names, so same provider is a necessity
    var providers = await getAllUsableProviders()

    var responses = await responseData.find({ provider : providers[0]._id}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "country": 1
    }).sort({ ipRequested: 'asc'})

    // prejst pole a nechat len take kde je ip adresa raz
    var uniqueResponses = []
    for (var x of responses) {
        var tmpRes = uniqueResponses.some(elem => elem.ipRequested === x.ipRequested)

        if (!tmpRes) {
            uniqueResponses.push(x)
        }
    }

    // ziskat unikatne countries
    var uniqueCountries = []
    for (var x of uniqueResponses) {
        var tmpCes = uniqueCountries.some(elem => elem.country === x.country)

        if (!tmpCes) {
            uniqueCountries.push({"country": x.country, "count": 0})
        }
    }

    // spocitat vyskyt country
    for (var x of uniqueResponses) {
        // vieme x.country
        // najst prvok v uniqueCountries ktory je .country === x.country a spravit .count++
        uniqueCountries[uniqueCountries.findIndex(el => el.country === x.country)].count++
    }

    // sort them
    uniqueCountries.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    var retObj = {}
    retObj.list = uniqueCountries

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of uniqueCountries) {
        retObj.table.push([order++, tmp.country, tmp.count])
    }

    return retObj
}

module.exports = {
    showAllIps, showFilteredIps, makeRequestController, showFusedResponse, showResponse,
    showTestMap, downloadResponses, analyseIps,
    acceptRequestController,
    deleteExistingResponse,
    getJsonWithCountedOrigin
}

