 /*
  * controller is usually a callback function that corresponds to routers  to handle requests. 
  */
 
/* imports */
const configuration = require("../config/config-nonRestricted")
const blklistProvider = require("../models/BlklistProvider")
const blklistResponse = require("../models/ResponseBlklist")
const { sendPromise } = require('../services/simpleCommunicator.js')
const { logError } = require('../services/helper.js')

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

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    console.log('refreshujem list')
    try {
        
        let acquiredList = await sendPromise(provider.baseUrl)
        
        // check every IP for type and save
        acquiredList = acquiredList.split(/\r?\n/)
        let newList = []

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

        // will only work on urlhaus
        let objParsed = new blklistResponse()
        objParsed.checked = false

        objParsed.provider = provider._id
        objParsed.total = newList.length
        objParsed.list =  newList

        // SAVE
        await objParsed.save()
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
    await blklistProvider.findByIdAndDelete(req.params.id)
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

module.exports = {
    showModule, addNewSource, editSource, showList,
    createNewProvider, editExistingProvider, deleteExistingProvider, refreshProviderList,
    saveAndRedirect
}

