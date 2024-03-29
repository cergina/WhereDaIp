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
const { logDebug, logError, yyyymmdd, getSubnetForIp } = require('../services/helper.js')
const { sendPromise, sendFakePromise } = require('../services/apiCommunicator.js')
const locationProvider = require('../models/locationProvider.js')
const {isCacheUsable} = require('../services/cacheFile.js')
const graphCache = require('../services/graphOutputCache.js')
const reqFile = require('../services/requestsFile.js')
const actionSaver = require('../services/actionSaver.js')
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
        "provider": 1,
        "subProvider": 1,
        "findings": 1
    }).sort({ addedAt: 'desc'})
  
    const providers = await locationProvider.find()

    // create shortened json to send to frontend 
    var customizedProviders = {}

    for (var i in providers) 
    {
        var item = { name: providers[i].name, slug: providers[i].slug, _id: providers[i]._id }
        customizedProviders[providers[i]._id] = item
    }

    var changedRequests = []
    for (var i in requests) {

        var item = 
        {
            id: requests[i].id,
            success: requests[i].success,
            ipRequested: requests[i].ipRequested,
            isSubnet: requests[i].isSubnet,
            addedAt: requests[i].addedAt,
            city: requests[i].city,
            country: requests[i].country,
            provider: requests[i].provider,
            subProvider: requests[i].subProvider,
            somethingFound: requests[i].findings.length > 0
        }

        changedRequests.push(item)
    }

    res.render(`${basePath}ips.ejs`, { requests: changedRequests, 
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
        "provider": 1,
        "subProvider": 1,
        "findings": 1
    }).sort({ addedAt: 'desc'})
    
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
            city: requests[i].city,
            country: requests[i].country,
            subProvider: requests[i].subProvider,
            somethingFound: requests[i].findings.length > 0
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
        if (res)
            res.redirect('/state')
        return
    }

    // just test
    if (res)
        res.redirect('/state')

    setTimeout(async function() {
        console.log(`analysis START`)
        // we want same same provider data
        var providers = await getAllUsableProviders()
        var useIndex = 0

        // let's analyze
        var responses = await responseData.find({}, {
            "success": 1,
            "ipRequested": 1,
            "addedAt": 1,
            "findings": 1,
            "isSubnet": 1,
            "subList": 1,
            "subProvider": 1
        }).sort({ ipRequested: 'asc'})
        var oneProviderResponses = await responseData.find({ provider : providers[useIndex]._id}, {
            "success": 1,
            "ipRequested": 1,
            "addedAt": 1,
            "findings": 1,
            "isSubnet": 1,
            "subList": 1,
            "subProvider": 1,
            "provider": 1
        }).sort({ipRequested: 'asc'})


        /* Ziskajme findings */
        var covFindings = await covertCtrl.reportFindingsHere(oneProviderResponses)
        console.log(`covFindings DONE`)
        var blkFindings = await blklistCtrl.reportFindingsHere(oneProviderResponses)
        console.log(`blkFindings DONE`)
        var susFindings = await suspectCtrl.reportFindingsHere(oneProviderResponses)
        console.log(`susFindings DONE`)

        /* mame findingy. teraz ich treba priradit ku kazdemu response.findings arrayu */
        try {
            for (var x of responses) {
                x.findings = []

                // sus
                var subnetEntered = undefined
                for (var s of susFindings) {

                    if (x.isSubnet === 0 && x.ipRequested === s.ipRequested) {
                        x.findings.push({text: s.text, foundAt: s.foundAt})
                    } else if (x.isSubnet === 1) {
                        for (var w of x.subList) {
                            var wsub = getSubnetForIp(w.address, 24)

                            if (subnetEntered !== wsub && w.address ===  s.ipRequested) {
                                x.findings.push({text: s.text, foundAt: s.foundAt})
                                subnetEntered = getSubnetForIp(s.ipRequested, 24)
                                break
                            }
                        }
                    }
                }

                // cov
                // for (var c of covFindings) {
                //     if (x.ipRequested === c.ipRequested) {
                //         x.findings.push({text: c.text, foundAt: c.foundAt})
                //     }
                // } 
                subnetEntered = undefined
                for (var c of covFindings) {
                    if (x.ipRequested === c.ipRequested) {
                        x.findings.push({text: c.text, foundAt: c.foundAt})    
                    }
                    // if (x.isSubnet === 0 && x.ipRequested === c.ipRequested) {
                    //     x.findings.push({text: c.text, foundAt: c.foundAt})    
                    // } else if (x.isSubnet === 1) {
                    //     for (var w of x.subList) {
                    //         var wsub = getSubnetForIp(w.address, 24)

                    //         if (subnetEntered !== wsub && w.address ===  c.ipRequested) {
                    //             x.findings.push({text: c.text, foundAt: c.foundAt})
                    //             subnetEntered = getSubnetForIp(c.ipRequested, 24)
                    //             break
                    //         }
                    //     }
                    // }
                }

                // blk
                // for (var b of blkFindings) {
                //     if (x.ipRequested === b.ipRequested) {
                //         x.findings.push({text: b.text, foundAt: b.foundAt})
                //     }
                // }
                subnetEntered = undefined
                for (var b of blkFindings) {
                    if (x.ipRequested === b.ipRequested)
                        x.findings.push({text: b.text, foundAt: b.foundAt})
                    // if (x.isSubnet === 0 && x.ipRequested === b.ipRequested) {
                    //     x.findings.push({text: b.text, foundAt: b.foundAt})
                    // } else if (x.isSubnet === 1 && x.ipRequested === b.ipRequested) {
                    //     x.fndings.push({text: b.text, foundAt: b.foundAt})

                    //     // for (var w of x.subList) {
                    //     //     var wsub = getSubnetForIp(w.address, 24)

                    //     //     if (subnetEntered !== wsub && w.address ===  b.ipRequested) {
                    //     //         x.findings.push({text: b.text, foundAt: b.foundAt})
                    //     //         subnetEntered = getSubnetForIp(b.ipRequested, 24)
                    //     //         break
                    //     //     }
                    //     // }
                    // }
                }

                x.save()
            }
            actionSaver.changeOccured()
        } catch(e) {
            console.log(e)
        } finally {
            console.log(`Analysis END`)
            await generalCtrl.setFree(3)
        }
    }, 500)

    
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
const searchForIpsController = async (batch, isLast) => {
    try {
        // only use active ones
        var providers = await getAllUsableProviders()

        
        // for every address find, if not send and get
        batch.forEach(address => {
            // var addr = address.ips[0]
            // var arr = addr.split('.')
            // if (arr[3] === '0')
            //     addr = address.ips[1]
            var addr = undefined
            if (address.ipv6)
                addr = address.ipv6
            else
                addr = address.ips[0]

            providers.forEach(async provider => {
                
                // IPv6
                if (address.ipv6) {
                    // get geolocation data
                    sendPromise(addr, provider)
                    .then(async res => {
                        // logDebug geolokacia
                        //logDebug(res)
                        let extractedData = extractDataFromResponse(addr, res, provider)
                        await extractedData.save()
                    })
                    .catch(err => logError(err))
                // IPv4
                } else {
                    // already found response ?
                    let foundData = await findResponseSubnetWithSameSuspectAndProvider(address.subnet, address.provider, provider)
    
                    if (foundData) {
                        // append IP addresses inside
                        foundData.subList.push({ address: addr})
                        await foundData.save()
                    } else {
                        // get geolocation data
                        sendPromise(addr, provider)
                        .then(async res => {
                            // logDebug geolokacia
                            //logDebug(res)
                            let extractedData = extractSubnetDataFromResponse(addr, address, res, provider)
                            await extractedData.save()
                        })
                        .catch(err => logError(err))
                    }
                }
                
            })
        })

        // allow for source cache
        // call for changes
        if  (isLast === true)
            actionSaver.changeOccured()
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
    var addresses = req.body.ip_addresses_to_lookup.split("\r\n").sort().filter(item => item)

    //logDebug(addresses)
    
    // supports IPv4 and IPv6, but accepts only minimal like 192.168.0.1 and no 192.168.0.001
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?invalid=1`)
        return
    }

    try {
        // remove ip addresses that were already geolocated
        var willBeSet = await returnOnlyAddressesThatWereNotGeolocated(addresses)

        if (willBeSet && willBeSet.arr.length === 0) {
            if (willBeSet.added)
                res.redirect(`${configuration.WWW_REQ_NEW}/?added=1`)
            else
                res.redirect(`${configuration.WWW_REQ_NEW}/?geolocated=1`)
            return
        }

        /* NEW VERSION */
        
        // vytvor list, ktory bude mat polia podla subnetov (ak nie je IPv6)
        var list = []
        var subnetObject = undefined
        var activeSubnet = undefined
        for (var x of willBeSet) {
            var subnet = undefined

            // Ak IPv6 tak nemozeme to zistovat ten subnet
            if (net.isIP(x) === 6) {
                if (activeSubnet) 
                    list.push(subnetObject)

                subnetObject = {'ipv6': x, 'provider': undefined}
                list.push(subnetObject)
                
                activeSubnet = undefined
                subnetObject = undefined
                continue
            // IPv4
            } else {
                subnet = getSubnetForIp(x, 24)
            }

            // add IP to subnet that exists
            if (subnet === activeSubnet) {
                subnetObject.ips.push(x)
            // add current subnetObj and create new subnet and first IP
            } else if (activeSubnet) {
                list.push(subnetObject)

                activeSubnet = subnet
                subnetObject = {'subnet': activeSubnet, 'provider': undefined, 'ips': []}
                subnetObject.ips.push(x)
            // nothing exists yet
            } else {
                activeSubnet = subnet
                subnetObject = {'subnet': activeSubnet, 'provider': undefined, 'ips': []}
                subnetObject.ips.push(x)
            }

        }
        // last iteration needs manual  addition
        if (subnetObject !== undefined)
            list.push(subnetObject)

        // confirm all ok
        console.log(list)

        // Divide subnets by Geolocation LIMIT
        var limit = await reqFile.setGeolocationLimit()
        var limitedList = []
        var activeList = []
        for (var x of list) {
            activeList.push(x)

            if (activeList.length === limit) {
                limitedList.push(activeList)
                activeList = []
            }
        }
        if (activeList.length > 0)
            limitedList.push(activeList)

        // check if well divided by max IP limit
        console.log(limitedList)

        reqFile.addNewSet(limitedList)

        /* OLD VERSION */
        // var providers = await getAllUsableProviders()

        // // for every address send
        // addresses.forEach(address => {
        //     logDebug(providers)
        //     providers.forEach(provider => {
        //         sendPromise(address, provider) // this one is real
        //         //sendFakePromise(address, provider)
        //             .then(async res => {
        //                 logDebug(res)

        //                 let extractedData = extractDataFromResponse(address, res, provider)

        //                 await extractedData.save()
        //             })
        //             .catch(err => logError(err))
        //     })
        // })

        // this needs to be done differently because sometimes there can be more requests and the time will not be enough
        setTimeout(function() {
            res.redirect(`${configuration.WWW_STATE}`);
        }, 500)
    } catch (e) {
        logError(e)
    }
}


// PRIVATE

const findResponseSubnetWithSameSuspectAndProvider = async (subnet, suspect, provider) => {
    var responses = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "isSubnet": 1,
        "subProvider": 1,
        "subList": 1,
        "provider": 1
    })

    if (!responses || responses.length === 0)
        return null

    let foundData = responses.find(resp => {
        var t1 = resp.isSubnet
        if (t1 === 0) 
            return false

        var t2 = resp.subProvider?.equals(suspect)
        var t3 = resp.provider?.equals(provider._id)
        var t4 = resp.ipRequested === subnet

        if (t1 && t2 && t3 && t4)
            return true
    })

    if (foundData)
        return foundData
    else
        return null
}

const returnOnlyAddressesThatWereNotGeolocated = async (list) => {
    var responses = await responseData.find({}, {
        "success": 1,
        "ipRequested": 1,
        "isSubnet": 1,
        "subProvider": 1,
        "subList": 1,
        "provider": 1
    })

    if (!responses || responses.length === 0)
        return list

    let toDelete = []
    var added = false
    for (var l of list) {
        var ipv4 = true
        if (net.isIPv4(l))
            ipv4 = true
        else
            ipv4 = false

        var subnet = undefined
        if (ipv4)
            subnet = getSubnetForIp(l, 24)
        
        var investigate = true

        for (var r of responses) {
            var changed = false

            if (investigate === false)
                break
            
            if (r.isSubnet === 1) {
                // is same subnet?
                // if yes, check everyone inside subList
                if (subnet === r.ipRequested) {
                    var found = false

                    for (var s of r.subList) {
                        if (investigate === false)
                            break

                        if (s.address === l) {
                            found = true
                            toDelete.push(l)
                            investigate = false
                        }
                    }

                    // ak nic nebolo najdene, nejdeme geolokalizovat tu istu IP znova
                    if (found === false) {
                        r.subList.push({address: l})
                        toDelete.push(l)
                        changed = true
                    }
                }
            } else {
                if (r.ipRequested === l) {
                    toDelete.push(l)
                    investigate = false
                }
            }


            if (changed) {
                try {
                    added = true
                    await r.save()
                } catch (e) {console.log(e)}
            }
        }
    }


    var toRet = {added: added, arr: []}
    for (var l of list) {
        if (toDelete.includes(l)) {

        } else {
            toRet.arr.push(l)
        }
    }

    return toRet
}

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
const getJsonForMapRequests = async (cached) => {
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
        "longitude": 1,
        "isSubnet": 1,
        "subList": 1
    }).sort({ ipRequested: 'asc'})

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
    
    uniqueResponses.sort((a, b) => (a.findings.length < b.findings.length) ? 1 : -1)
    // uniqueValues.sort((a, b) => (a.count < b.count) ? 1 : -1)

    for (var x of uniqueResponses) {
        // put to points
        var detailStringHtml = ''
        var detailString = ''
        //var additionalDetail = x.isSubnet === 1 ? `/24 (${x.subList.length} IP addresses)`: ``
        var additionalDetail = x.isSubnet === 1 ? `/24`: ``
        var inc = 0
        for (var f of x.findings) {
            ++inc
            var af = f.text.split('|')
            detailStringHtml    = `${detailStringHtml}\n<br>${inc}. ${af[0]} "${af[3].slice(1)}" ${af[1]}`
            detailString        = `${detailString}\n\r${inc}. ${af[0]} "${af[3].slice(1)}" ${af[1]}`
        }

        // doplnit info o nebezpecnosti IP adresy, nejake findingy a tak
        retObj.points.push({
            "htmlSnippet": `<b>Location marked!</b><br>Target found<br/><span style='font-size:15px;color:#999'>${x.ipRequested}${additionalDetail}<br>${detailStringHtml}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        
    
        // put to fgTableValues
        retObj.fgTableValues.push([
            `${x.ipRequested}${additionalDetail}`,
            `${detailString}`,
            `${x.as}`,
            `${x.city}`,
            `${x.country}`
        ])
    }


    return retObj
}

/* for graphs */
const getJsonWithCountedOrigin = async (cached) => {
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
        "isSubnet": 1,
        "subList": 1,
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
        if (x.isSubnet && x.subList.length > 0) {
            uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count+= x.subList.length
        } else {
            uniqueCountries[uniqueCountries.findIndex(el => el.name === foundName)].count++
        }
    }
    for (var x of cached.cachedBloklistResponses) {
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

const getJsonWithCountedAs = async (cached) => {
    // we want same AS names, so same provider is a necessity
    var providers = await getAllUsableProviders()

    // zisti ktory index obsahuje validnu hodnotu 
    var searchedIndex = providers.findIndex(provider => provider.response.asPath !== '')

    var responses = await responseData.find({ provider : providers[searchedIndex]._id}, {
        "success": 1,
        "ipRequested": 1,
        "isSubnet": 1,
        "subList": 1,
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
    var collider = []
    for (var x of uniqueResponses) {
        var as = x.as.split(' ')[0]
        if (collider.indexOf(as) === -1) {
            collider.push(as)
            uniqueValues.push({"name": x.as, "as": as, "count": 0})
        }

        // var tmpCes = uniqueValues.some(elem => elem.name === x.as)

        // if (!tmpCes) {
        //     uniqueValues.push({"name": x.as, "as": x.as, "count": 0})
        // }
    }
    for (var x of cached.cachedBloklistResponses) {
        if (x.list[0].asnumber) {
            for (var y of x.list) {
                var as = `AS${y.asnumber}`
                if (collider.indexOf(as) === -1) {
                    collider.push(as)
                    uniqueValues.push({"name": as, "as": as, "count": 0})
                }

                // var toFind = `AS${y.asnumber} `
                // var tmpCes = uniqueValues.some(elem => {
                //     return elem.name.includes(toFind)
                // })
                
                // if (!tmpCes)
                //     uniqueValues.push({"name": toFind, "count": 0})
            }
        }
    }

    
    // pozvysovat pocty ake su v uniqueResp
    for (var x of uniqueResponses) {
        var index = collider.indexOf(x.as.split(' ')[0])
        if (x.isSubnet === 0)
            uniqueValues[index].count++
        else if (x.isSubnet === 1)
            uniqueValues[index].count+= x.subList.length
    }
    // pozvysovat pocty v cached.cachedBloklistResponses a pripadne pridat rovno do pola ak neni
    for (var x of cached.cachedBloklistResponses) {
        if (x.list[0].asnumber) {
            for (var y of x.list) {
                var toFind = `AS${y.asnumber}`
                var index = collider.indexOf(toFind)
                uniqueValues[index].count++
            }
        }
    }
    // pozvysovat pocty ake su v uniqueResp
    // for (var x of uniqueResponses) {
    //     if (x.isSubnet === 0)
    //         uniqueValues[uniqueValues.findIndex(el => el.name === x.as)].count++
    //     else  if (x.isSubnet === 1)
    //         uniqueValues[uniqueValues.findIndex(el => el.name === x.as)].count+= x.subList.length
    // }
    // // pozvysovat pocty v cached.cachedBloklistResponses a pripadne pridat rovno do pola ak neni
    // for (var x of cached.cachedBloklistResponses) {
    //     if (x.list[0].asnumber) {
    //         for (var y of x.list) {
    //             var toFind = `AS${y.asnumber} `
    //             uniqueValues[uniqueValues.findIndex(el => el.name.includes(toFind))].count++
    //         }
    //     }
    // }

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
        "isSubnet": 1,
        "subList": 1,
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
        var toInc = x.isSubnet === 1 ? x.subList.length : 1
        var wasInc = false

        // GEODB part
        if (x.mobile === 'true') {
            uniqueValues[0].count += toInc
            wasInc = true
        }
        if (x.proxy === 'true') {
            uniqueValues[1].count += toInc
            wasInc = true
        }
        if (x.hosting === 'true') {
            uniqueValues[2].count += toInc
            wasInc = true
        }
        
        // COVERT from findings
        if (x.findings.some(el => {
            if (el?.text?.includes("COVERT"))
                return true === el?.text?.includes("VPN")
            return false
        })) { uniqueValues[4].count += toInc; wasInc = true }
        if (x.findings.some(el => {
            if (el?.text?.includes("COVERT"))
                return true === el?.text?.includes("TOR")
            return false
        })) { uniqueValues[5].count += toInc; wasInc = true; }

        if (wasInc === false)
            uniqueValues[3].count += toInc
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

    // set in cache for map calculation
    graphCache.setTopHideouts(uniqueValues)

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

