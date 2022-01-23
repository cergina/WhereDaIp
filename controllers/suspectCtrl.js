 // controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require("../config/config-nonRestricted")
const { logDebug, logError, logInfo, logRaw, yyyymmdd } = require('../services/helper.js')
const { findTagById, findIdByTag, getCountOfTag, addTag, removeTag, decreaseTag, getAllTags, removeAllTags } = require('../services/tagSupport.js')

const suspectProvider = require("../models/suspectProvider")
const net = require('net')
const { WWW_SUSPECT_HOME } = require("../config/config-nonRestricted")
const { nextTick } = require("process")
const res = require("express/lib/response")

const baseViewFolder = `${WWW_SUSPECT_HOME}`

// for Internal
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
        "name" : 1,
        "addedAt": 1,
        "description": 1,
        "slug": 1
    }).sort({ addedAt: 'desc'})
    //const providers = await suspectProvider.find({}).sort({addedAt: 'desc'})

    console.log(providers)

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
        // TODO error not found
    }
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
    
    if (req.provider.restMethod === 1)
        addresses = req.body.ip_addresses.split("\r\n").filter(item => item)
    
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_SUSPECT_HOME}/providers/${req.params.slug}/?invalid=1`)
        return
    }

    req.tmpAddresses = addresses

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

// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        console.log(``)
        console.log(``)

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
            //logInfo(`Successfull Creating/Editing ${provider.name}`)
            res.redirect(`/${baseViewFolder.slice(1)}` + `/providers/${provider.slug}/?changed=1`)
            //res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { provider: provider, siteTitle: 'Manually add new list' })
        } catch (e) {
            res.render(`${baseViewFolder.slice(1)}` + `/${viewName}`, { provider: provider, siteTitle: 'Manually add new list' })
        }
    } 
}

module.exports = {
    getAllUsableProviders,
    showTags, showAllProviders, newSource, addNewList,
    editProvider,
    acceptNewList, acceptEditExisting, acceptNewProvider, 
    deleteExistingSource, removeAllTagsTestOnly,
    saveAndRedirect
}