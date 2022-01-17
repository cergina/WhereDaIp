 // controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require("../config/config-nonRestricted")
const { logDebug, logError, logInfo, logRaw, yyyymmdd } = require('../services/helper.js')

const suspectProvider = require("../models/suspectProvider")
const tagDb = require("../models/tagDb")
const net = require('net')
const { WWW_SUSPECT_HOME } = require("../config/config-nonRestricted")

const baseViewFolder = `${WWW_SUSPECT_HOME}`

// for Internal
async function getAllUsableProviders() {

    var providers = await suspectProvider.find({ isActive: 1})
    
    return providers
}

// for GETs

const showTags = async (req, res) => {
    const tags = await tagDb.find({}).sort({name: 'desc'})

    res.render(`${baseViewFolder.slice(1)}` + '/suspicious.ejs', { siteTitle: 'Suspect Module (Tags)', tags: tags})
} 

const showAllProviders = async (req, res) => {
    // dont return whole object
    const providers = await suspectProvider.find({}, {
        "isActive": 1,
        "name" : 1,
        "addedAt": 1,
        "description": 1,
        "slug": 1
    }).sort({ addedAt: 'desc'})
    
    res.render(`${baseViewFolder.slice(1)}` + '/providerList.ejs', { providers: providers, siteTitle: 'Suspicious activity providers' })
}

const newSource = (req, res) => {
    res.render(`${baseViewFolder.slice(1)}` + '/newProvider.ejs', { source: new suspectProvider(), siteTitle: 'Add new source' })
}

const addNewList = (req, res) => {
    res.render(`${baseViewFolder.slice(1)}` + '/addList.ejs', { source: new suspectProvider(), siteTitle: 'Manually add new list' })
}

const deleteExistingSource = async (req, res) => {
    await suspectProvider.findByIdAndDelete(req.params.id)
    res.redirect(`${baseViewFolder}`)
}

// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let provider = req.provider

        provider.name = req.body.name
        provider.isActive = req.body.provider_enabled === 'on' ? 1 : 0

        // debug
        //logDebug(`Here is debug print of everything in covert object during saveAndRedirect\n${provider}`)
        

        try {
            provider = await provider.save()
            logInfo(`Successfull Creating/Editing ${provider.name}`)
            //res.redirect(`${baseViewFolder.slice(1)}` + '/${provider.slug}/?changed=1`)
        } catch (e) {
            //res.render(`${baseViewFolder.slice(1)}` + '/${viewName}`, { provider: provider })
        }
    } 
}

module.exports = {
    getAllUsableProviders,
    showTags, showAllProviders, newSource, addNewList,
    saveAndRedirect
}