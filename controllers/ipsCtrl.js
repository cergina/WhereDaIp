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
const {isCacheUsable} = require('../services/cacheFile.js')
const { getCountryNameByCode, getCountryArrayCountsZero } = require('../services/countries.js')

const basePath = `requests/`

// GETs
const showAllIps = async (req, res) => {
    const requests = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "isSubnet": 1,
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
        "isSubnet": 1,
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
            isSubnet: requests[i].isSubnet,
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
        await generalCtrl.setBusyFor(3, configuration.BLOCK_TIME_ANALYSIS)
        await generalCtrl.simulateWorkAndThenSetIdle(3, 1)
    } else {
        console.log("Analyse is already occupied")
        res.redirect('/state')
        return
    }

    // just test
    res.redirect('/state')

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

            // cov
            for (var c of covFindings) {
                if (x.ipRequested === c.ipRequested) {
                    x.findings.push({text: c.text, foundAt: c.foundAt})
                }
            } 

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
        await generalCtrl.setFree(3)
    }
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

// regular geolocation event - suspicious list
// TODO geoEvent
const searchForIpsController = async (batch) => {
    try {
        // only use active ones
        var providers = await getAllUsableProviders()
        
        // for every address send
        batch.forEach(address => {
            // var addr = address.ips[0]
            // var arr = addr.split('.')
            // if (arr[3] === '0')
            //     addr = address.ips[1]
            var addr = address.ips[0]

            providers.forEach(provider => {
                sendPromise(addr, provider)
                    .then(async res => {
                        logDebug(res)

                        let extractedData = extractSubnetDataFromResponse(addr, address, res, provider)

                        await extractedData.save()
                    })
                    .catch(err => logError(err))
            })
        })
    } catch(e) {
        logError(e)
    }
}

// Form send request
const acceptRequestController = async (req, res) => {

    if (configuration.PASS !== req.body.password_for_lookup) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?unauthorized=1`)
        return
    }

    //logInfo('I will look onto it')

    // it's necessarry to clear \r\n, maybe on linux it will be only \n, will have to test
    var addresses = req.body.ip_addresses_to_lookup.split("\r\n").filter(item => item)

    //logDebug(addresses)
    
    // supports IPv4 and IPv6, but accepts only minimal like 192.168.0.1 and no 192.168.0.001
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?invalid=1`)
        return
    }
    
    try {
        // TODO
        // haha

        
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
// - pre jednu IP adresu
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
// - pre subnet IP adries
function extractSubnetDataFromResponse(address, subnetWithList, originalResponse, provider) {
    let extractedData = new responseData()

    // subnet part
    extractedData.isSubnet = 1
    extractedData.subProvider = subnetWithList.provider
    extractedData.subList = []
    for (var x of subnetWithList.ips) {
        extractedData.subList.push({'address': x})
    }
    

    // regular part
    extractedData.ipRequested = subnetWithList.subnet
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
    
    // TODO - not implemented yet - and wont be

    return extractedData
}


// For EVENTS
/* for maps */
const getJsonForMapRequests = async () => {
    // we want same same provider data
    var providers = await getAllUsableProviders()

    var useIndex = 0
    var x = 0
    for (var prov of providers) {
        if (prov.response.asPath)
            useIndex = x
 
        x = x + 1
    }

    // musi mat veci  ako AS, Country
    var responses = await responseData.find({ provider : providers[useIndex]._id}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "city": 1,
        "country": 1,
        "as": 1,
        "findings": 1,
        "latitude": 1,
        "longitude": 1
    }).sort({ ipRequested: 'asc'})

    // TODO maybe sa stane, ze [0] nebude mat to as a preto by sa malo kontrolovat 
    // ci ma a zvolit takeho providera radsej

    // prejst pole a nechat len take kde je ip adresa raz
    var uniqueResponses = []
    for (var x of responses) {
        var tmpRes = uniqueResponses.some(elem => elem.ipRequested === x.ipRequested)

        if (!tmpRes) {
            uniqueResponses.push(x)
        } 
    }


    // Generate JSON base
    var retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    // generate table header
    retObj.fgTableNames.push("IP")
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("AS")
    retObj.fgTableNames.push("City")
    retObj.fgTableNames.push("Country")
    
    for (var x of uniqueResponses) {
        // put to points
        var detailStringHtml = ''
        var detailString = ''
        var inc = 0
        for (var f of x.findings) {
            ++inc
            var af = f.text.split('|')
            detailStringHtml    = `${detailStringHtml}\n<br>${inc}. ${af[0]} "${af[3].slice(1)}" ${af[1]}`
            detailString        = `${detailString}\n\r${inc}. ${af[0]} "${af[3].slice(1)}" ${af[1]}`
        }

        // doplnit info o nebezpecnosti IP adresy, nejake findingy a tak
        retObj.points.push({
            "htmlSnippet": `<b>Location marked!</b><br>Target found<br/><span style='font-size:15px;color:#999'>${x.ipRequested}<br>${detailStringHtml}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        
    
        // put to fgTableValues
        // TODO 
        // 'len tak' treba nahradit realnym findingom
        retObj.fgTableValues.push([
            `${x.ipRequested}`,
            `${detailString}`,
            `${x.as}`,
            `${x.city}`,
            `${x.country}`
        ])
    }


    return retObj
}

/* for graphs */
const getJsonWithCountedOrigin = async (cacheBlkProv, cacheBlkResp) => {
    // we want same country names, so same provider is a necessity
    var providers = await getAllUsableProviders()

    var place = 0
    var i = 0
    for (var x of providers) {
        if (x.response.countryCodePath)
            place = i

        i = i + 1
    }
    var responses = await responseData.find({ provider : providers[place]._id}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "countryCode": 1
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
    var uniqueCountries = getCountryArrayCountsZero()

    // spocitat vyskyt country
    for (var x of uniqueResponses) {
        // vieme x.country
        var foundName = getCountryNameByCode(x.countryCode)

        // najst prvok v uniqueCountries ktory je .country === x.country a spravit .count++
        // if (uniqueCountries.findIndex(el => el.name === foundName) == undefined)
        //     console.log('jop')
        // if (uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)] == undefined)
        //     console.log('kop')
        // if (uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count == undefined)
        //     console.log('lop')

        // increase
        uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count++
    }
    for (var x of cacheBlkResp) {
        if (x.list[0].country) {
            for (var y of x.list) {
                // vieme x.country
                var foundName = getCountryNameByCode(y.country)

                // najst prvok v uniqueCountries ktory je .country === x.country a spravit .count++
                // if (uniqueCountries.findIndex(el => el.name === foundName) == undefined)
                //     console.log('dop')
                // if (uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)] == undefined)
                //     console.log('fop')
                // if (uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count == undefined)
                //     console.log('gop')
            
                // increase
                uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count++
            }
        }
    }

    // sort them
    uniqueCountries = uniqueCountries.filter(a => a.count > 0)
    uniqueCountries.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    var retObj = {} 
    retObj.list = uniqueCountries

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of uniqueCountries) {
        retObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}

const getJsonWithCountedAs = async (cacheBlkProv, cacheBlkResp) => {
    // we want same AS names, so same provider is a necessity
    var providers = await getAllUsableProviders()

    // zisti ktory index obsahuje validnu hodnotu 
    var searchedIndex = providers.findIndex(provider => provider.response.asPath !== '')

    var responses = await responseData.find({ provider : providers[searchedIndex]._id}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "as": 1
    }).sort({ ipRequested: 'asc'})

    // prejst pole a nechat len take kde je ip adresa raz
    var uniqueResponses = []
    for (var x of responses) {
        var tmpRes = uniqueResponses.some(elem => elem.ipRequested === x.ipRequested)

        if (!tmpRes) {
            uniqueResponses.push(x)
        }
    }

    // ziskat unikatne AS pre uniqueResp
    var uniqueValues = []
    for (var x of uniqueResponses) {
        var tmpCes = uniqueValues.some(elem => elem.name === x.as)

        if (!tmpCes) {
            uniqueValues.push({"name": x.as, "count": 0})
        }
    }
    for (var x of cacheBlkResp) {
        if (x.list[0].asnumber) {
            for (var y of x.list) {
                var toFind = `AS${y.asnumber} `
                var tmpCes = uniqueValues.some(elem => {
                    return elem.name.includes(toFind)
                })
                
                if (!tmpCes)
                    uniqueValues.push({"name": toFind, "count": 0})
            }
        }
    }

    

    // pozvysovat pocty ake su v uniqueResp
    for (var x of uniqueResponses) {
        uniqueValues[uniqueValues.findIndex(el => el.name === x.as)].count++
    }
    // pozvysovat pocty v cacheBlkResp a pripadne pridat rovno do pola ak neni
    for (var x of cacheBlkResp) {
        if (x.list[0].asnumber) {
            for (var y of x.list) {
                var toFind = `AS${y.asnumber} `
                uniqueValues[uniqueValues.findIndex(el => el.name.includes(toFind))].count++
            }
        }
    }

    uniqueValues = uniqueValues.filter(a => a.count > 0)
    uniqueValues.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    var retObj = {}
    retObj.list = uniqueValues

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of uniqueValues) {
        retObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}
const getJsonWithCountedCovered = async () => {
    // we want only that provider that has access to this information
    var providers = await getAllUsableProviders()

    // zisti ktory index obsahuje validnu hodnotu (mozno ale aj viac providerov bude mat pristup tak TODO)
    var searchedIndex = providers.findIndex(provider => provider.response.mobilePath !== '')

    var responses = await responseData.find({ provider : providers[searchedIndex]._id}, {
        "success": 1,
        "ipRequested": 1,
        "addedAt": 1,
        "mobile": 1,
        "proxy": 1,
        "hosting": 1,
        "findings": 1
    }).sort({ ipRequested: 'asc'})

    // prejst pole a nechat len take kde je ip adresa raz
    var uniqueResponses = []
    for (var x of responses) {
        var tmpRes = uniqueResponses.some(elem => elem.ipRequested === x.ipRequested)

        if (!tmpRes) {
            uniqueResponses.push(x)
        }
    }

    // ziskat unikatne nothing/tor/proxy/hosting
    var uniqueValues = [
        {"name": "Cellular", "count": 0},
        {"name": "Proxy/VPN/TOR", "count": 0},
        {"name": "Hosting", "count": 0},
        {"name": "Nothing", "count": 0},
        {"name": "VPN", "count": 0},
        {"name": "TOR", "count": 0}
    ]

    for (var x of uniqueResponses) {
        // GEODB part
        if (x.mobile === 'true')
            uniqueValues[0].count++
        if (x.proxy === 'true')
            uniqueValues[1].count++
        if (x.hosting === 'true')
            uniqueValues[2].count++
        if (x.mobile === 'false' && x.proxy === 'false' && x.hosting === 'false')
            uniqueValues[3].count++
        
        // COVERT from findings
        if (x.findings.some(el => {
            return true === el?.text?.includes("COVERT", "VPN")
        })) uniqueValues[4].count++
        if (x.findings.some(el => {
            return true === el?.text?.includes("COVERT", "TOR")
        })) uniqueValues[5].count++
    }

    uniqueValues = uniqueValues.filter(a => a.count > 0)
    uniqueValues.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    var retObj = {}
    retObj.list = uniqueValues

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of uniqueValues) {
        if (tmp.count > 0)
            retObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}

const getAllGeolocatedIps = async () => {
    var responses = await responseData.find({})
    return responses
}

module.exports = {
    showAllIps, showFilteredIps, makeRequestController, showFusedResponse, showResponse,
    showTestMap, downloadResponses, analyseIps,
    searchForIpsController, acceptRequestController,
    deleteExistingResponse,
    getJsonWithCountedOrigin, getJsonWithCountedAs,
    getJsonWithCountedCovered, 
    getJsonForMapRequests, 
    getAllGeolocatedIps
}

