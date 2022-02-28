 /*
  * controller is usually a callback function that corresponds to routers  to handle requests. 
  */
 
/* imports */
const configuration = require("../config/config-nonRestricted")
const blklistProvider = require("../models/BlklistProvider")

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
    const providers = await blklistProvider.find().sort({ addedAt: 'desc'})


    res.render('basic/pureTextArea.ejs', { textArea: providers, siteTitle: 'Test' })
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
    createNewProvider, editExistingProvider, deleteExistingProvider,
    saveAndRedirect
}

