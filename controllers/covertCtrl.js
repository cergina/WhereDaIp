// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require("../config/config-nonRestricted")
const { logDebug, logError, logInfo, logRaw, yyyymmdd, uniq } = require('../services/helper.js')
const { sendPromise } = require('../services/simpleCommunicator.js')
const actionSaver = require('../services/actionSaver.js')
const coverSource = require("../models/coverSource")
const net = require('net')

const baseViewFolder = `${configuration.WWW_COVER_HOME}`

// for Internal
async function getAllUsableSources() {

    var sources = await coverSource.find({ isActive: 1})
    
    return sources
}


// for GETs
const showAllSources = async (req, res) => {
    // dont return whole object
    const sources = await coverSource.find({}, {
        "isActive": 1,
        "total": 1,
        "name" : 1,
        "addedAt": 1,
        "lastEditAt": 1,
        "description": 1,
        "slug": 1
    }).sort({ addedAt: 'desc'})

    // slow returns everything
    //const sources = await coverSource.find().sort({ addedAt: 'desc'})
    
    res.render(`${baseViewFolder.slice(1)}` + '/covert.ejs', { sources: sources, siteTitle: 'Cover Sources list' })
}

const newSource = (req, res) => {
    res.render(`${baseViewFolder.slice(1)}` + '/newSource.ejs', { source: new coverSource(), siteTitle: 'New source' })
}

const editSource = async (req, res) => {
    const source = await coverSource.findOne({ slug: req.params.slug })

    if (source == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    res.render(`${baseViewFolder.slice(1)}` + '/showSource.ejs', { source: source, siteTitle: 'Edit source' })
}


// for POSTs
const createNewSource = async (req, res, next) => { 
    req.source = new coverSource()
    next()
}

const editExistingSource = async (req, res, next) => {
    req.source = await coverSource.findOne({ slug: req.params.slug })
    next()
}

const obtainSourceList = async (req, res, next) => {
    req.source = await coverSource.findOne({ slug: req.params.slug })

    try {
        let acquiredList
        acquiredList = await sendPromise(req.source)
        
        // check every IP for type and save
        acquiredList = acquiredList.split(/\r?\n/).filter(item => item).sort();
        
        
        var addressesX =  []
        for (var a of acquiredList) {
            addressesX.push(a.split('/')[0])
        }
        acquiredList = uniq(addressesX)


        let newList = []
        acquiredList.forEach(address => {
            var res = net.isIP(address)

            // 0 means invalid string - return should work as continue C# equivavelnt for foreach
            if (res === 0) {
                return;
            }

            // 0 is IPv4, 1 is IPv6
            let obj = {
                ip: address,
                type: (res === 4) ? 0 : 1
            }

            newList.push(obj)
        });

        // non zero length array should be considered okay
        if (newList.length > 0) {
            req.source.list = newList
            actionSaver.changeOccured()
        }

    } catch (e) {
        logError(e)
    }

    next()
}

const clearSourceList = async (req, res, next) => {
    req.source = await coverSource.findOne({ slug: req.params.slug })

    req.source.list = []

    next()
}

const deleteExistingSource = async (req, res) => {
    await coverSource.findByIdAndDelete(req.params.id)
    res.redirect(`${baseViewFolder}`)
}

// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let source = req.source

        source.name = req.body.name
        source.isActive = req.body.source_enabled === 'on' ? 1 : 0

        source.type = req.body.source_type
        source.description = req.body.description

        source.lastEditAt = new Date()
        
        source.baseUrl = req.body.api_url
        source.restMethod = req.body.api_method
        
        source.format = req.body.response_format

        // debug
        //logDebug(`Here is debug print of everything in covert object during saveAndRedirect\n${source}`)
        

        try {
            source = await source.save()
            logInfo(`Successful Creating/Editing ${source.name}`)
            res.redirect(`${baseViewFolder}` + `/${source.slug}/?changed=1`)
        } catch (e) {
            res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { source: source })
        }
    } 
}

// work with lists
function appendAndRedirect(viewName) {
    return async (req, res) => {
        let source = req.source

        source.lastEditAt = new Date()

        // debug
        //logDebug(`Here is debug print of everything in covert object during appendAndRedirect\n${source}`)
        

        try {
            source = await source.save()
            logInfo(`Successfully changed list size of source ${source.name} is ${source.list.length}`)
            res.redirect(`${baseViewFolder}` + `/${source.slug}/?changed=1`)
        } catch (e) {
            res.render(`${baseViewFolder.slice(1)}\\${viewName}`, { siteTitle: "Correction", source: source, error: 1 })
        }
    } 
}

const reportFindingsHere = async (arg) => {
    // get this only once
    var lists = await coverSource.find({}, {
        "name": 1,
        "slug": 1,
        "type": 1,
        "list": 1
    })

    var retArr = []

    // zoznam zo zoznamov
    for (var xList of lists) {
        var processed = null
        var previousIp = null

        // ip adresa zo zoznamu
        for (var xIp of arg) {
            // porovnavat iba ak uz neni v retArr taka ip adresa ( pozor, moze byt vo viac zoznamoch preto reset processed - zaujima nas iba pre 1 list aby nebola duplikacia )
            if (xIp.isSubnet === 0 && previousIp !== xIp.ipRequested) {
                if (xList.list.some(e => e.ip === xIp.ipRequested)) {
                    previousIp = xIp.ipRequested
                    processed = {
                        ipRequested: xIp.ipRequested,
                        text: `COVERT | ${xList.type === 1 ? 'TOR_EXIT_NODES' : 'VPN_SERVERS'} | ${xList.slug} | ${xList.name}`,
                        foundAt: Date.now()
                    }

                    retArr.push(processed)
                }
            } else {
                if (xIp.isSubnet === 1) {
                    // min 1 tu je urcite
                    var addr = xIp.subList[0].address.split('.')
                    addr = `${addr[0]}.${addr[1]}.${addr[2]}.`

                    for (let i=0; i<xList.list.length; i++) {
                        // currIp
                        var curr = xList.list[i].ip.split('.')
                        curr = curr.length > 2 ? `${curr[0]}.${curr[1]}.${curr[2]}.` : undefined

                        if (addr === curr) {
                            previousIp = xIp.ipRequested
                            
                            processed = {
                                ipRequested: xIp.ipRequested,
                                text: `COVERT | ${xList.type === 1 ? 'TOR_EXIT_NODES' : 'VPN_SERVERS'} | ${xList.slug} | ${xList.name}`,
                                foundAt: Date.now()
                            }
        
                            retArr.push(processed)
                            break
                        }
                    }
                }
                // var toLook = true
                // if (toLook && xIp.isSubnet === 1) {

                //     for (var c of xIp.subList) {

                //         if (previousIp !== c.address && xList.list.some(e => e.ip === c.address)) {
                //             previousIp = c.address
                //             processed = {
                //                 ipRequested: c.address,
                //                 text: `COVERT | ${xList.type === 1 ? 'TOR_EXIT_NODES' : 'VPN_SERVERS'} | ${xList.slug} | ${xList.name}`,
                //                 foundAt: Date.now()
                //             }
        
                //             retArr.push(processed)

                //             toLook = false
                //             break
                //         }

                //     }

                // }
            }

        }
    }

    return retArr
}

module.exports = {
    getAllUsableSources,
    showAllSources, newSource, editSource,
    createNewSource, editExistingSource, deleteExistingSource,
    obtainSourceList, clearSourceList,
    saveAndRedirect, appendAndRedirect,
    reportFindingsHere
}
