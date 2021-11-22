// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require('../config/config-nonRestricted.js')
const responseData = require("../models/responseData")
const net = require('net')
const { getAllUsableProviders } = require('./providers.js')
const { logDebug, logInfo, logError } = require('../services/helper.js')
const { sendPromise, sendFakePromise } = require('../services/apiCommunicator.js')
const locationProvider = require('../models/locationProvider.js')


// GETs
const showAllIps = async (req, res) => {
    const requests = await responseData.find().sort({ addedAt: 'desc'})
    const providers = await locationProvider.find()

    // create shortened json to send to frontend 
    var customizedProviders = {}

    for (var i in providers) {
        var item = { name: providers[i].name, slug: providers[i].slug, _id: providers[i]._id }
        customizedProviders[providers[i]._id] = item
    }

    res.render('requests/ips.ejs', { requests: requests, 
        providers: customizedProviders,
        siteTitle: 'List of IPs'})
}

const showFilteredIps = async (req, res) => {
    const requests = await responseData.find().sort({ addedAt: 'desc'})
    const providers = await locationProvider.find()
    
    // create shortened json to send to frontend 
    var customizedProviders = {}

    // TODO

    res.render('requests/filteredIps.ejs', { requests: requests, 
        providers: customizedProviders,
        siteTitle: 'Fused IP information'})
}

const showTestMap = (req, res) => {
    res.render('requests/mapTest.ejs')
}

const makeRequestController = (req, res) => {
    res.render('requests/makeRequest.ejs', { siteTitle: 'New request'})
}

const showResponse = async (req, res) => {
    const response = await responseData.findById(req.params.id)

    if (response == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    const provider = await locationProvider.findById(response.provider)

    res.render('requests/showResponse.ejs', { response: response, provider: provider, siteTitle: 'Response details' })
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
            console.log(providers)
            providers.forEach(provider => {
                sendPromise(address, provider) // this one is real
                //sendFakePromise(address, provider)
                    .then(async res => {
                        console.log(res)

                        let extractedData = extractDataFromResponse(address, res, provider)

                        await extractedData.save()
                    })
                    .catch(err => console.log(err))
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

module.exports = {
    showAllIps, showFilteredIps, makeRequestController, showResponse,
    showTestMap,
    acceptRequestController,
    deleteExistingResponse
}

