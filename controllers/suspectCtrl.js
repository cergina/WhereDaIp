 // controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require("../config/config-nonRestricted")
const { logError, logInfo, stringIsAValidUrl, uniq, getSubnetForIp } = require('../services/helper.js')
const { findTagById, findIdByTag, addTag, decreaseTag, getAllTags, removeAllTags } = require('../services/tagSupport.js')
const { sendPromise } = require('../services/simpleCommunicator.js')

const suspectProvider = require("../models/suspectProvider")
const tagDb = require("../models/tagDb")
const net = require('net')
const { WWW_SUSPECT_HOME } = require("../config/config-nonRestricted")
const res = require("express/lib/response")
const cached = require('../services/cacheFile.js')
const actionSaver = require('../services/actionSaver.js')
const graphCache = require('../services/graphOutputCache.js')
const reqFile = require('../services/requestsFile.js')

const baseViewFolder = `${WWW_SUSPECT_HOME}`

// for Internal
const getJsonWithCountedListTags = async () => {
    var ro = []

    const tags = await getAllTags()

    // init known tags with 0 counts
    for (var x of tags) {
        var tempObj = {
            "tagId": x._id.toString(),
            "tagName": x.name,
            "numOfIps": 0
        }

        ro.push(tempObj)
    }

    //
    const providers = await suspectProvider.find({}, {
        "name": 1,
        "tagList": 1,
        "ipList": 1
    })
    
    for (var provider of providers) {
        //console.log(`provider ${provider.name} `)
        //console.log(`tagy ze : ${provider.tagList}`)
        //console.log(`a je ${provider.ipList.length} adries\n`)
        //console.log(`provider ${provider.name} ma tagy ze : ${provider.tagList} a je ${provider.ipList.length} adries`)

        var countOfIps = provider.ipList.length

        for (var tag of ro) {
            if (provider.tagList.includes(tag.tagId)) {
                tag.numOfIps += countOfIps
            }
        }
    }

    
    ro.sort((a, b) => (a.numOfIps < b.numOfIps) ? 1 : -1)
    graphCache.setTopSusTags(ro)

    // 
    // for chart.js
    var retObj = {}
    retObj.list = ro
    
    //
    // create table for grid.js
    retObj.table = []
    var order = 1
    
    for (var tmp of ro) {

        var x = []
        x.push((order++).toString())
        x.push(tmp.tagName)
        x.push(tmp.numOfIps.toString())
        
        retObj.table.push(x)
    }


    return retObj
}

async function getAllUsableProviders() {
}

// for GETs

const showTags = async (req, res) => {

    //await removeTag('testTag')
    //await addTag('dridex')
    //await decreaseTag('werwer')

    const tags = await getAllTags()

    res.render(`${baseViewFolder.slice(1)}` + '/suspicious.ejs', { siteTitle: 'Suspect Module (Tags)', tags: tags})
} 

const showAllProviders = async (req, res) => {
    //dont return whole object
    const providers = await suspectProvider.find({}, {
        "isActive": 1,
        "total": 1,
        "analyzed": 1,
        "name" : 1,
        "addedAt": 1,
        "description": 1,
        "slug": 1
    }).sort({ addedAt: 'desc'})
    //const providers = await suspectProvider.find({}).sort({addedAt: 'desc'})

    //console.log(providers)

    res.render(`${baseViewFolder.slice(1)}` + '/providerList.ejs', { providers: providers, siteTitle: 'Suspicious activity providers' })
}

const newSource = (req, res) => {
    res.render(`${baseViewFolder.slice(1)}` + '/newProvider.ejs', { provider: new suspectProvider(), siteTitle: 'Add new provider' })
}

const addNewList = (req, res) => {
    res.render(`${baseViewFolder.slice(1)}` + '/addList.ejs', { provider: new suspectProvider(), siteTitle: 'Manually add new list' })
}

const editProvider = async (req, res) => {
    var provider = await suspectProvider.findOne({slug: req.params.slug})

    // If they are to be visible they need to be here
    provider.tagListOnlyNames = []
    for (let i=0; i < provider.tagList.length; i++) {
        var tempName = await findTagById(provider.tagList[i])
        provider.tagListOnlyNames.push(tempName)
    }

    let text = ""
    for (let ip of provider.ipList) {
        text += `${ip.ip}\n`
    }
    provider.ipAddresses = text

    // if list show list rest NONE else its GET then show provider
    if (provider.restMethod === 1) {
        res.render(`${baseViewFolder.slice(1)}` + '/editJoinedProvider.ejs', { provider: provider, siteTitle: 'Edit existing list' })
    } else if (provider.restMethod === 0) {
        res.render(`${baseViewFolder.slice(1)}` + '/editSourceProvider.ejs', { provider: provider, siteTitle: 'Edit existing provider' })
    } else {
    }
}

const geolocateProvider = async (req, res) => {
    var provider = await suspectProvider.findOne({slug: req.params.slug})

    // count if was not count yet
    if (provider.total === 0) {
        provider.total = provider.ipList.length
        console.log(`Number of IP addresses in suspect list "${provider.name}" was counted to ${provider.total}.`)
    }

    // if checked already do nothing
    // TODO uncomment - but maybe not, because if someone deletes the list or sth after geolocating once we will not geolocate it again
    // if (provider.total > 0 && provider.analyzed === provider.total) {
    //     console.log(`The whole list "${provider.name}" was already analyzed.`)
    //     res.redirect(`${configuration.WWW_SUSPECT_HOME}`)
    //     return
    // }

    if (provider.total === 0) {
        console.log(`Nothing to analyze in this list "${provider.name}".`)
        res.redirect(`${configuration.WWW_SUSPECT_HOME}`)
        return
    }

    var ips = cached.getUniqueGeolocatedIps()
    if (ips === null) {
        res.redirect(`${configuration.WWW_SUSPECT_HOME}`)
        return
    }
    
    // create a SET
    var willBeSet = []
    provider.analyzed = 0
    for (var x of provider.ipList) {
        if (ips.length > 0 && ips.includes(x.ip)) {
            x.checked = 1
            provider.analyzed++
        } else {
            willBeSet.push(x.ip)
        }
    }

    //console.log(provider)

    try {
        provider.save()
    } catch (e) { console.log(e) }

    // if checked already do nothing
    if (provider.total > 0 && provider.analyzed === provider.total) {
        console.log(`The whole list "${provider.name}" was already analyzed. (found out during SET generation)`)
        res.redirect(`${configuration.WWW_SUSPECT_HOME}`)
        return
    }

    console.log(`We have list "${provider.name}" to analyze with: ${provider.total} IPs and already analyzed ${provider.analyzed}`)
    res.redirect(`${configuration.WWW_SUSPECT_HOME}`)

    // GET GEOLOCATION MINIMUM per minute
    var limit = await reqFile.setGeolocationLimit()
    console.log(`We will divide list of IPs in this provider by ${limit}`)

    // just in case, sort by asc ip address list
    // netreba, je

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

            subnetObject = {'ipv6': x, 'provider': provider._id}
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
            subnetObject = {'subnet': activeSubnet, 'provider': provider._id, 'ips': []}
            subnetObject.ips.push(x)
        // nothing exists yet
        } else {
            activeSubnet = subnet
            subnetObject = {'subnet': activeSubnet, 'provider': provider._id, 'ips': []}
            subnetObject.ips.push(x)
        }

    }
    // last iteration needs manual  addition
    if (subnetObject !== undefined)
        list.push(subnetObject)

    // confirm all ok
    //console.log(list)

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
}


const deleteExistingSource = async (req, res) => {
    //console.log(req.params)

    let found = await suspectProvider.findOne({slug: req.params.slug})
    
    //console.log(` found: ${found}`)
    for (let tmpId of found.tagList) {
        
        //console.log(` ftbi: ${tmpId}`)
        let tmpTag = await findTagById(tmpId)
        //console.log(`\n MAME: ${tmpTag}`)
        await decreaseTag(tmpTag)
    }

    await suspectProvider.findOneAndDelete({slug: req.params.slug })
    
    res.redirect(`${baseViewFolder}`)
}


const removeAllTagsTestOnly = async (req, res) => {
    // DANGEROUS
    await removeAllTags()

    res.redirect(`${baseViewFolder}`)
}

// for POSTs
const acceptNewList = async (req, res, next) => {
    logInfo('list addition requested')

    var addresses = req.body.ip_addresses.split("\r\n").filter(item => item)
    var addressesX =  []
    for (var a of addresses) {
        addressesX.push(a.split('/')[0])
    }
    addresses = uniq(addressesX)

    // supports IPv4 and IPv6, but accepts only minimal like 192.168.0.1 and no 192.168.0.001
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_SUSPECT_LIST_NEW}/?invalid=1`)
        return
    }
    
    //logInfo(addresses)

    req.provider = new suspectProvider()
    req.tmpAddresses = addresses

    // this is list addition: baseUrl "", restMethod: 1, isActive: yes
    req.provider.isActive = 1
    req.provider.baseUrl = ""
    req.provider.restMethod = 1

    next()
}


const acceptEditExisting = async (req, res, next) => {
    logInfo('edit requested')
    
    req.provider = await suspectProvider.findOne({ slug: req.params.slug })

    if (!req.provider)
        return
    

    var addresses = []
    
    // REST METHOD === 1 === NONE
    if (req.provider.restMethod === 1) {
        addresses = req.body.ip_addresses.split("\r\n").filter(item => item)
        var addressesX =  []
        for (var a of addresses) {
            addressesX.push(a.split('/')[0])
        }
        addresses = uniq(addressesX)
    
        
        if (! addresses.every( currentValue => net.isIP(currentValue))) {
            res.redirect(`${configuration.WWW_SUSPECT_HOME}/providers/${req.params.slug}/?invalid=1`)
            return
        }

        req.tmpAddresses = addresses
        
    } else if (req.provider.restMethod === 0) {
        // REST METHOD === 0 === GET
        // checked in next() saveAndRedirecTest
        // just check if URL is valid
        //console.log(`URL: req.body.baseUrl ${req.body.api_url}`)
        if (! stringIsAValidUrl(req.body.api_url)) {
            res.redirect(`${configuration.WWW_SUSPECT_HOME}/providers/${req.params.slug}/?urlinvalid=1`)
            return
        }
    }

    next()
}

const acceptNewProvider = async (req, res, next) => {
    logInfo('provider addition requested')

    req.provider = new suspectProvider()

    // get  IP addresses IRL
    req.tmpAddresses = []

    // this is provider addition: baseUrl "html form id: api_url", restMethod: 0, isActive: yes
    req.provider.isActive = 1
    req.provider.baseUrl = req.body.api_url
    req.provider.restMethod = 0


    // bug: zmazanie listu co je provider nezmaze tagy

    next()
}


function saveAndRedirectTest(viewName) {
    return async (req, res) => {
        let provider = req.provider
        
        
        /* // */
        // Basics - current name is later overwritten - used for finding (evade tag bug when changing name)
        provider.name = (provider.name) ? provider.name : req.body.name
        provider.baseUrl = req.body.api_url

        /* // */
        // Tags
        // - if exist in DB
        //      - add missing
        //      - remove deleted
        // - if not in DB
        //      - add every tag
        var tags = req.body.tags.split(",").filter(item => item)
        tags = tags.map(item => item.replace(/[^a-zA-Z0-9 ]/g, ''))
        tags = tags.map(item => item.trim())
        tags = tags.filter((entry, index) => tags.indexOf(entry) === index);

        let previousProvider = await suspectProvider.findOne({name: provider.name})
        provider.tagList = []

        // IF EXISTS ALREADY
        if (previousProvider) {
            // get current tags
            var oldTags = []
            for (let temp of previousProvider.tagList) {
                var tempTag = await findTagById(temp)
                oldTags.push(tempTag)   // that we have
            }

            // add missing tags
            var missingTags = []
            for (let tag of tags) {
                if (!oldTags.includes(tag)) {
                    missingTags.push(tag)
                }
            }
            
            for (let tag of missingTags) {
                await addTag(tag)
            }

            // Remove tags not present
            var obsoleteTags = []
            for (let tag of oldTags) {
                if (!tags.includes(tag)) {
                    obsoleteTags.push(tag)
                }
            }

            for (let tag of obsoleteTags) {
                await decreaseTag(tag)
            }

            // Make sure tagList is up to date
            for (let tag of tags) {
                let temp = await findIdByTag(tag)
                provider.tagList.push(temp._id)
            }
        // DOES NOT EXIST IN DB
        } else {
            for (let i=0; i < tags.length; i++) {
                let temp = await addTag(tags[i])
                provider.tagList.push(temp._id)
            }
        }

        provider.tagListOnlyNames = []
        for (let i=0; i < provider.tagList.length; i++) {
            var tempName = await findTagById(provider.tagList[i])
            provider.tagListOnlyNames.push(tempName)
        }

        /* // */
        // IP lists
        if (provider.restMethod === 0) {            // if 0 => has source, get from URL
            try {
                let acquiredList = await sendPromise(provider.baseUrl)
                
                // check every IP for type and save
                acquiredList = acquiredList.split(/\r?\n/).filter(item => item).sort()
                var addressesX =  []
                for (var a of acquiredList) {
                    addressesX.push(a.split('/')[0])
                }
                acquiredList = uniq(addressesX)
                let newList = []

                acquiredList.forEach(address => {
                    var res = net.isIP(address)

                    if (res === 0)
                        return

                    newList.push(address)
                })

                // non zero length array should be considered okay
                // ! NO else ! old list has to exist if new is empty
                if (newList.length > 0)
                    req.tmpAddresses = newList
            } catch(e) {
                logError(e)
            }
        } else if (provider.restMethod === 1){      // if 1 => list is present in the form
            // checked in first acceptEdit/acceptCreateList
        }

        provider.ipList = []
        if (req.tmpAddresses) {
            req.tmpAddresses.forEach(element => {
                provider.ipList.push({
                    ip: element,
                    type: net.isIPv4(element) ? 0 : 1
                })
            });
        }

        
        /* // */
        // Basics - has to be here, because search happens with older name if present before
        provider.name = req.body.name
        provider.description = req.body.description
        provider.lastEditAt = new Date()

        /* // */
        // DATABASE
        try {
            const newProvider = await provider.save()
            if (newProvider === provider) {
                console.log("Succesfully saved")
            } else {
                console.log("Not sucesfully saved")
            }
            
            res.redirect(`/${baseViewFolder.slice(1)}` + `/providers/${provider.slug}/?changed=1`)
            actionSaver.changeOccured()
        } catch (e) {
            res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { provider: provider, siteTitle: 'Manually add new list' })
        }
    }
}

const reportFindingsHere = async (arg) => {
    // get this only once
    var lists = await suspectProvider.find({}, {
        "name": 1,
        "slug": 1, 
        "tagList": 1,
        "ipList": 1
    })

    var retArr = []

    // zoznam zo zoznamov
    for (var xList of lists) {
        var processed = null
        var previousIp = null
        var listTags = `tags:   `
        for (var xTag of xList.tagList) {
            listTags = listTags + (await tagDb.findById(xTag)).name + ', '
        }
        listTags = listTags.slice(0, -2)

        // ip adresa zo zoznamu
        for (var xIp of arg) {
            // porovnavat iba ak uz neni v retArr taka ip adresa ( pozor, moze byt vo viac zoznamoch preto reset processed - zaujima nas iba pre 1 list aby nebola duplikacia )
            if (xIp.isSubnet === 0 && previousIp !== xIp.ipRequested) {
                if (xList.ipList.some(e => e.ip === xIp.ipRequested)) {
                    previousIp = xIp.ipRequested
                    processed = {
                        ipRequested: xIp.ipRequested,
                        text: `SUSPECT | ${listTags} | ${xList.slug} | ${xList.name}`,
                        foundAt: Date.now()
                    }

                    retArr.push(processed)
                }
            } else {
                // Ak to je subnet, prejst IP adresy vnutri subListu
                var toLook = true
                if (toLook && xIp.isSubnet === 1) {
                    
                    for (var s of xIp.subList) {

                        if (previousIp !== s.address && xList.ipList.some(e => e.ip === s.address)) {
                            previousIp = s.address
                            processed = {
                                ipRequested: s.address,
                                text: `SUSPECT | ${listTags} | ${xList.slug} | ${xList.name}`,
                                foundAt: Date.now()
                            }
        
                            retArr.push(processed)

                            toLook = false
                            break
                        }
                        
                    }
                }
            }

        }
    }

    return retArr
}


module.exports = {
    getAllUsableProviders,
    showTags, showAllProviders, newSource, addNewList,
    editProvider, geolocateProvider,
    acceptNewList, acceptEditExisting, acceptNewProvider, 
    deleteExistingSource, removeAllTagsTestOnly,
    saveAndRedirectTest,
    getJsonWithCountedListTags,
    reportFindingsHere
}




















































// BKP
// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        //console.log(``)
        //console.log(``)

        let provider = req.provider

        provider.name = req.body.name
        provider.description = req.body.description
        provider.lastEditAt = new Date()
        
        //
        // TAGs
        // - if exist in DB
        //      - add missing
        //      - remove deleted
        // - if not in DB
        //      - add every tag
        var tags = req.body.tags.split(",").filter(item => item)
        tags = tags.map(item => item.replace(/[^a-zA-Z0-9 ]/g, ''))
        tags = tags.map(item => item.trim())
        tags = tags.filter((entry, index) => tags.indexOf(entry) === index);

        let previousProvider = await suspectProvider.findOne({name: provider.name})
        provider.tagList = []

        // IF EXISTS ALREADY
        if (previousProvider) {
            //console.log('exists')

            // get current tags
            var oldTags = []
            //console.log(`previous provider contains: ${previousProvider.tagList}`)
            for (let temp of previousProvider.tagList) {
                var tempTag = await findTagById(temp)
                //console.log(`find by ${temp} | result is ${tempTag}`)
                oldTags.push(tempTag)   // that we have
            }

            //console.log(`We have old tags [${oldTags}]`)
            //console.log(`We have new tags [${tags}]`)
            
            // add missing tags
            var missingTags = []
            for (let tag of tags) {
                //console.log(`looking for ${tag} in [${oldTags}]`)
                if (!oldTags.includes(tag)) {
                    missingTags.push(tag)
                }
            }
            
            //console.log(`MissingTags: [${missingTags}]`)
            for (let tag of missingTags) {
                await addTag(tag)
            }

            // Remove tags not present
            var obsoleteTags = []
            for (let tag of oldTags) {
                //console.log(`looking for ${tag} in [${tags}]`)
                if (!tags.includes(tag)) {
                    obsoleteTags.push(tag)
                }
            }

            //console.log(`ObsoleteTags: [${obsoleteTags}]`)
            for (let tag of obsoleteTags) {
                await decreaseTag(tag)
            }

            // Make sure tagList is up to date
            //console.log(`||`)
            //console.log(`Make sure: ${tags.length} | ${tags}`)
            for (let tag of tags) {
                let temp = await findIdByTag(tag)
                provider.tagList.push(temp._id)
            }
            //console.log(`final tagList [${provider.tagList}]`)
            
        // DOES NOT EXIST IN DB
        } else {
            //console.log('not exists')

            for (let i=0; i < tags.length; i++) {
                let temp = await addTag(tags[i])
                provider.tagList.push(temp._id)
            }
        }

        provider.tagListOnlyNames = []
        for (let i=0; i < provider.tagList.length; i++) {
            //console.log(`searching for ${provider.tagList[i]}`)
            var tempName = await findTagById(provider.tagList[i])

            //console.log(`Found ${tempName}`)
            provider.tagListOnlyNames.push(tempName)
        }
        
        // ZISKANIE IP ADRIES ak je to REST API GET
        // restMethod == 0 GET a restMethod == 1 NONE
        if (provider.restMethod === 0) {

            try {
                let acquiredList
                acquiredList = await sendPromise(req.baseUrl)
                
                // check every IP for type and save
                acquiredList = acquiredList.split(/\r?\n/).filter(item => item).sort();
        
                let newList = []
                acquiredList.forEach(address => {
                    var res = net.isIP(address)
        
                    // 0 means invalid string - return should work as continue C# equivavelnt for foreach
                    if (res === 0) {
                        return;
                    }
        
                    newList.push(address)
                });
        
                //console.log(`newList: ${newList}`)
                
                // non zero length array should be considered okay
                if (newList.length > 0)
                    req.tmpAddresses = newList
        
            } catch (e) {
                logError(e)
            }

        }

        
        //console.log(`req.tmpAddresses: ${req.tmpAddresses}`)
        //
        // IPs
        provider.ipList = []
        req.tmpAddresses.forEach(element => {
            provider.ipList.push({
                ip: element,
                type: net.isIPv4(element) ? 0 : 1
            })
        });
        
        //
        // DATABASE
        try {
            const newProvider = await provider.save()
            if (newProvider === provider) {
                console.log("Succesfully saved")
            } else {
                console.log("Not sucesfully saved")
            }
            //logInfo(`Successful Creating/Editing ${provider.name}`)
            res.redirect(`/${baseViewFolder.slice(1)}` + `/providers/${provider.slug}/?changed=1`)
            //res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { provider: provider, siteTitle: 'Manually add new list' })
        } catch (e) {
            res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { provider: provider, siteTitle: 'Manually add new list' })
        }
    } 
}