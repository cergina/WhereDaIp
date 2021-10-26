// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require('../config/config-nonRestricted.js')
const responseData = require("../models/responseData")
const net = require('net')
const { getAllUsableProviders } = require('./providers.js')
const { logDebug, logInfo, logError } = require('../services/helper.js')
const { sendPromise, sendFakePromise } = require('../services/apiCommunicator.js')


// GETs
const showAllIps = async (req, res) => {
    const requests = await responseData.find().sort({ addedAt: 'desc'})
    res.render('requests/ips.ejs', { requests: requests, siteTitle: 'List of IPs'})
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

    res.render('requests/showResponse.ejs', { response: response, siteTitle: 'Response details' })
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
    
    //logInfo(`I'm gonna send it`)
    
    // TODO send and process it
    try {
        var providers = await getAllUsableProviders()

        // for every address send
        addresses.forEach(address => {
            console.log(providers)
            providers.forEach(provider => {
                //send(address, provider) // this one is most likely obsolete already
                //sendPromise(address, provider) // this one is real
                sendFakePromise(address, provider)
                    .then(async res => {
                        console.log(res)

                        let extractedData = extractDataFromResponse(address, res, provider)

                        await extractedData.save()
                    })
                    .catch(err => console.log(err))
            })
        })

        //res.redirect(`${configuration.WWW_REQ_HOME}/${provider.slug}/?changed=1`)
        res.redirect(`${configuration.WWW_REQ_HOME}`)
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
    extractedData.success = originalResponse[provider.response.successPath]
    
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

    return extractedData
}

function extractFromXML(extractedData, originalResponse, provider) {
    // success, type, country, city, latitude, longitude, isp is necessary
    
    // TODO - not implemented yet

    return extractedData
}

module.exports = {
    showAllIps, makeRequestController, showResponse,
    showTestMap,
    acceptRequestController,
    deleteExistingResponse
}

