 /*
  * controller is usually a callback function that corresponds to routers  to handle requests. 
  */
 
/* imports */
const configuration = require("../config/config-nonRestricted")
const blklistProvider = require("../models/BlklistProvider")
const blklistResponse = require("../models/ResponseBlklist")
const { sendPromise } = require('../services/simpleCommunicator.js')
const { logError } = require('../services/helper.js')
const { getCachedBloklistProviders, getCachedBloklistResponses, getUniqueGeolocatedIps } = require('../services/cacheFile.js')
const graphCache = require('../services/graphOutputCache.js')
const actionSaver = require('../services/actionSaver.js')
const net = require('net')

/* settings */
const basePath = `${configuration.WWW_BLKLIST_HOME}`

// GETs
const showModule = async (req, res) => {
    const providers = await blklistProvider.find().sort({ addedAt: 'desc'})
    res.render(`${basePath.slice(1)}/module.ejs`, { siteTitle: 'Blocklist Module', providers: providers})
} 
const addNewSource = async (req, res) => {
    res.render(`${basePath.slice(1)}/addNewSource.ejs`, { provider: new blklistProvider(), siteTitle: 'Form to add new blocklist source'})
}
const editSource = async (req, res) => {
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    res.render('blklist/showSource.ejs', { provider: provider, siteTitle: 'Edit source' })
}
const showList = async (req, res) => {    
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    
    const list = await blklistResponse.findOne({provider: provider._id})


    renderList(req, res, list)
}
const refreshProviderList = async (req, res) => {
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null) {
        res.redirect(`${configuration.WWW_ROOT}`)
        return
    }

    console.log('refreshujem list')
    try {
        
        let acquiredList = await sendPromise(provider.baseUrl)
       
        // we save responses here
        let newList = []

        // check every IP for type and save
        if (provider.format === 1) {
            // its already in json, do nothing
            
            acquiredList.forEach(address => {
                let temp = {}
                temp.checked = "false"

                temp.country = address[provider.response.country]
                temp.externalId = address[provider.response.externalId]
                temp.externalDate = address[provider.response.externalDate]
                temp.url = address[provider.response.url]
                temp.urlStatus = address[provider.response.urlStatus]
                temp.lastOnline = address[provider.response.lastOnline]
                temp.tags = address[provider.response.tags]
                temp.externalUrl =  address[provider.response.externalUrl]
                temp.ip = address[provider.response.ip]
                temp.port = address[provider.response.port]
                temp.hostname = address[provider.response.hostname]
                temp.asnumber = address[provider.response.asnumber]
    
                newList.push(temp)
            })
        }
        else if (provider.format === 0) {
            // CSV is split with commas and new line
            acquiredList = acquiredList.split(/\r?\n/).filter(item => item)
            
            acquiredList.forEach(address => {
                var res = address.startsWith('#')
    
                if (res === true)
                    return
    
                // now we know its not a comment
                let addParsed = address.split("\",\"")
    
                let temp = {}
                temp.checked = "false"
                temp.externalId = addParsed[0]
                temp.externalDate = addParsed[1]
                temp.url = addParsed[2]
                temp.urlStatus = addParsed[3]
                temp.lastOnline = addParsed[4]
                temp.tags = addParsed[6]
                temp.externalUrl = addParsed[7]
    
                newList.push(temp)
            })
        }

        // CSV will only work on urlhaus abuse list
        let objParsed = new blklistResponse()
        objParsed.checked = false

        objParsed.provider = provider._id
        objParsed.total = newList.length
        objParsed.list =  newList

        // SAVE
        await objParsed.save()
        actionSaver.changeOccured()
    } catch(e) {
        logError(e)
    }
    console.log('end of list refresh')

    renderList(req, res, provider)
}

// POSTs
const createNewProvider = async (req, res, next) => {
    req.provider = new blklistProvider()
    next()
}
const editExistingProvider = async (req, res, next) => {
    req.provider = await blklistProvider.findById(req.params.id)
    next()
}
const deleteExistingProvider = async (req, res) => {
    var respsToDelete = await blklistResponse.find({provider: req.params.id})
    for (var x of respsToDelete) {
        await blklistResponse.findByIdAndDelete(x._id)
    }
    
    await blklistProvider.findByIdAndDelete(req.params.id)
    res.redirect(`${configuration.WWW_BLKLIST_HOME}`)
}
const deleteResponsesWithoutProvider = async (req, res) => {
    // vsetkych poskytovatelov
    // vsetky odpovede
    // pre kazdu odpoved
    // zisti ci sa nachadza poskytovatel v provs
    // ak hej ok
    // ak nie, zmaz odpoved
    
    var provs = await blklistProvider.find()
    var resps = await blklistResponse.find()
    var arrToDel = []
    for (var r of resps) {
        if (provs.find(p => p._id.equals(r.provider))) {
            // ok
        } else {
            arrToDel.push(r._id)
        }
    }
    
    for (var r of arrToDel) {
        await blklistResponse.findByIdAndDelete(r)
    }

    res.redirect(`${configuration.WWW_BLKLIST_HOME}`)
}


// Private methods
function renderList(req, res, provider) {
    res.render('basic/pureTextArea.ejs', { 
        textArea: provider,
        slug: req.params.slug,
        site: { 
            siteTitle: 'View list',
            title: 'Blocklist list',
            crumbs: [{url: "/", name: 'Home'}, {url: "/blklist", name: 'Blocklist'}, {name: 'List view'}]
        }
     })
}

/* */
// For EVENTS
const getJsonWithCountedOnline = async (cached) => {
    var ro = []

    const providers = cached.cachedBloklistProviders
    
    
    ro.push({"name": "online", "count": 0})
    ro.push({"name": "offline", "count": 0})
    ro.push({"name": "unknown", "count": 0})

    var countOn = 0
    var countOff = 0
    var countNA = 0

    for (var provider of providers) {
        var tmpResp = cached.cachedBloklistResponses.find(temp => provider._id.equals(temp.provider))

        if (tmpResp?.list) {
            for (var stat of tmpResp.list) {
                if (stat.urlStatus === 'online')
                    countOn++
                else if (stat.urlStatus === 'offline')
                    countOff++
                else
                    countNA++
            }
        }
    }

    ro[0].count = countOn
    ro[1].count = countOff
    ro[2].count = countNA

    // sort them
    ro = ro.filter(a => a.count > 0)
    ro.sort((a, b) => (a.count < b.count) ? 1 : -1)

    var retObj = {}
    retObj.list = ro

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of ro) {
        retObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}
/* */





// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let provider = req.provider


        provider.name = req.body.name
        provider.description = req.body.description

        provider.lastEditAt = new Date()
        provider.format = req.body.response_format
        provider.isActive = req.body.service_enabled === 'on' ? 1 : 0
        provider.baseUrl = req.body.api_url

        provider.response.externalId = req.body.blk_resp_externalId
        provider.response.externalDate = req.body.blk_resp_externalDate
        provider.response.url = req.body.blk_resp_url
        provider.response.urlStatus = req.body.blk_resp_urlStatus
        provider.response.lastOnline = req.body.blk_resp_lastOnline
        provider.response.tags = req.body.blk_resp_tags
        provider.response.externalUrl = req.body.blk_resp_externalUrl

        provider.response.ip = req.body.blk_resp_ip
        provider.response.port = req.body.blk_resp_port
        provider.response.hostname = req.body.blk_resp_hostname
        provider.response.asnumber = req.body.blk_resp_asnumber
        provider.response.country = req.body.blk_resp_country

        console.log(provider)

        try {
            provider = await provider.save()
            console.log('ok')



            console.log('done')
            res.redirect(`${configuration.WWW_BLKLIST_HOME}/${provider.slug}/?changed=1`)
        } catch (e) {
            console.log(`chyba ${e}`)
            res.render(`${configuration.WWW_BLKLIST_HOME.slice(1)}\\${viewName}`, { siteTitle: "Provider (correction)", provider: provider, error: 1 })
        }
    }
}


const reportFindingsHere = async (arg) => {
    // get this only once
    const lists = getCachedBloklistProviders()
    const blkResponses = getCachedBloklistResponses()

    var retArr = []

    // zoznam odpovedi
    for (var xBlkResp of blkResponses) {
        var processed = null
        var previousIp = null

        // ip adresa zo zoznamu
        for (var xIp of arg) {

            // porovnat iba ak uz neni v retArr ta ista IP
            if (xIp.isSubnet === 0 && previousIp !== xIp.ipRequested) {
                // ci obsiahnuta v zozname a vratit ktora to je
                
                var found = xBlkResp.list.filter(e => {
                    // if (e.url === 'http://41.78.172.77:42550/Mozi.m' && xIp.ipRequested === '41.78.172.77')
                    //     console.log('som tu')
                    
                    // if (e.url === 'http://110.85.99.215:43230/Mozi.a' && xIp.ipRequested === '110.85.99.215')
                    //     console.log('som tu 2')

                    var retVal = false
                    if (e.ip)
                        retVal = e.ip === xIp.ipRequested
                    
                    if (retVal === false && e.url) {
                        var sepIp = e.url.split('/')
                        sepIp = sepIp.length > 2 ? sepIp[2].split(':') : ''

                        return sepIp[0] === xIp.ipRequested
                    }
                    else
                        return retVal
                })

                if (found.length > 0) {

                    var tempName  = lists.find(l => {
                        if (l._id.id.equals(xBlkResp.provider.id))
                            return l
                    })

                    previousIp = xIp.ipRequested
                    processed = {
                        foundAt: Date.now(),
                        ipRequested: xIp.ipRequested,
                        //text: `BLKLIST | ${xBlkResp.tags} | ${tempName.slug} | ${tempName.name}`
                        text: `BLKLIST | ${found[0].tags} | ${tempName.slug} | ${tempName.name}`
                    }

                    retArr.push(processed)
                }
            // CAN BE SUBNET
            } else {
                // subnet is only IPv4
                if (xIp.isSubnet === 1) {
                    // ip adresa subnetu ktoru porovnavame
                    let cmpIp = xIp.subList[0].address.split('.')
                    cmpIp = `${cmpIp[0]}.${cmpIp[1]}.${cmpIp[2]}.`

                    // vsetko z blocklistu
                    let found = []
                    for (var xB of xBlkResp.list) {
                        // IP adresa, ktoru porovnavame jednu z blocklistu
                        var arr = xB.url ? xB.url.split('/') : undefined
                        var ip = ''
                        if (arr) {
                            ip = arr[2].split('.')
                            ip = `${ip[0]}.${ip[1]}.${ip[2]}.`
                        }
                        
                        //console.log(arr)
                        if (cmpIp === ip) {
                            found.push(xB)
                            break
                        }
                    }

                    // vlozit nalezy
                    if (found.length > 0) {
    
                        let tempName  = lists.find(l => {
                            if (l._id.id.equals(xBlkResp.provider.id))
                                return l
                        })
    
                        previousIp = xIp.ipRequested
                        processed = {
                            foundAt: Date.now(),
                            ipRequested: xIp.ipRequested,
                            text: `BLKLIST | ${found[0].tags} | ${tempName.slug} | ${tempName.name}`
                        }
    
                        retArr.push(processed)
                    }

                    // for (var s of xIp.subList) {
                        
                        
                    //     var found = xBlkResp.list.filter(e => {
        
                    //         var retVal = false
                    //         if (e.ip)
                    //             retVal = e.ip === s.address
                            
                    //         if (retVal === false && e.url)
                    //             return e.url.includes(s.address)
                    //         else
                    //             return retVal
                    //     })
        
                    //     if (found.length > 0) {
        
                    //         var tempName  = lists.find(l => {
                    //             if (l._id.id.equals(xBlkResp.provider.id))
                    //                 return l
                    //         })
        
                    //         previousIp = s.address
                    //         processed = {
                    //             foundAt: Date.now(),
                    //             ipRequested: s.address,
                    //             text: `BLKLIST | ${found[0].tags} | ${tempName.slug} | ${tempName.name}`
                    //         }
        
                    //         retArr.push(processed)
                    //     }




                    // }
                } // end of IPv4 comparison

            }
        }
    }

    return retArr
}


const getJsonWithCountedPorts = async (cached) => {
    // get all responses
    var responses = cached.cachedBloklistResponses

    var retArr = []
    const regexForPort = /:[0-9]+/g;


    // prejst vsetky blocklisty
    var uniqueValues = []
    for (var xResp of responses) {
        // prejst list z blocklist response
        //console.log(xResp)
        for (var xIp of xResp.list) {
            // ziskaj port z xIp.url
            var found = xIp.port
            
            if (!found) {
                found = xIp.url?.match(regexForPort);
                
                if (found)
                    found = found[0].substring(1)
            }
            
            if (found) {
                // zistit ci uz taky port
                var tmpCes = uniqueValues.find(elem => elem.name === found)
    
                if (tmpCes === undefined) {
                    uniqueValues.push({"name": found, "count": 1})
                } else {
                    tmpCes.count++
                }
            }
        }
    }

    // sort based on port occurence
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

const getJsonWithCountedSignatures = async (cached) => {
    // get all responses
    var responses = cached.cachedBloklistResponses

    var retArr = []
    const regexForSignatures = /[^,]+/g;


    // prejst vsetky blocklisty
    var uniqueValues = []
    for (var xResp of responses) {
        // prejst list z blocklist response
        for (var xIp of xResp.list) {
            // ziskaj signatury z xIp.
            const found = xIp.tags?.match(regexForSignatures);
            if (found) {
                // prejst vsetky signatury
                for (var xSig of found) {
                    // zistit ci uz taka signatura je
                    var tmpCes = uniqueValues.find(elem => elem?.name.toLocaleLowerCase() === xSig.toLocaleLowerCase())
                    
                    if (tmpCes === undefined) {
                        uniqueValues.push({"name": xSig, "count": 1})
                    } else {
                        tmpCes.count++
                    }
                }
            }
        }
    }

    // sort based on port occurence
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

    // set graphOutputCache for map calculations
    // graphCache.setTopSignatures(retObj.list)

    return retObj
}

const getJsonWithCountedDomainsAndHttp = async (cached) => {
    // get all responses
    var responses = cached.cachedBloklistResponses

    var retArr = []
    const regexForDomain = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;
    const regexForIps = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;

    
    // prejst vsetky blocklisty
    var doms = [
        {"name": "IPv4", count: 0}, 
        {"name": "IPv6", count: 0},
        {"name": "Domain", count: 0}
    ]
    var httpsArr = [
        {"name": "http", count: 0}, 
        {"name": "https", count: 0}
    ]
    for (var xResp of responses) {
        // prejst list z blocklist response
        for (var xUrl of xResp.list) {
            // ziskaj domeny z xIp.
            const found = xUrl.url?.match(regexForDomain);
            if (found) {
                // prejst vsetky ipcky
                var domain = found && found[1]
                var res = net.isIP(found[1].split(':')[0])
                
                // res is 4 its IPv4, res is 6 its IPv6, res is 0 its domain
                if (res === 4) {
                    doms[0].count++
                } else if (res === 6) {
                    doms[1].count++
                } else if (res === 0) {
                    doms[2].count++
                }
            }

            // zisti ci je to HTTP alebo HTTPS
            if (xUrl.url?.startsWith('https://')) {
                httpsArr[1].count++
            } else if (xUrl.url?.startsWith('http://')) {
                httpsArr[0].count++
            }
        }
    }
    // prejst nalezy geolokalizovane
    for (var g of cached.cachedUniqueGeolocatedIps) {
        
        if (g.type === 4)
            doms[0].count++
        else if (g.type === 6)
            doms[1].count++
    }

    // sort based on domain occurence
    doms = doms.filter(a => a.count > 0)
    doms.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    // sort based on http occurence
    httpsArr = httpsArr.filter(a => a.count > 0)
    httpsArr.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    var retObj = {}
    retObj.domObj = {}
    retObj.httpObj = {}
    retObj.domObj.list = doms
    retObj.httpObj.list = httpsArr    

    // GridJs doms
    retObj.domObj.table = []
    var order = 1
    
    for (var tmp of doms) {
        retObj.domObj.table.push([order++, tmp.name, tmp.count])
    }

    // GridJS http
    retObj.httpObj.table = []
    var order = 1
    
    for (var tmp of httpsArr) {
        retObj.httpObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}

module.exports = {
    showModule, addNewSource, editSource, showList,
    createNewProvider, editExistingProvider, deleteExistingProvider, refreshProviderList,
    getJsonWithCountedOnline,
    saveAndRedirect,
    reportFindingsHere,
    getJsonWithCountedPorts, getJsonWithCountedSignatures,
    getJsonWithCountedDomainsAndHttp,
    deleteResponsesWithoutProvider
}

