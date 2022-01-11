// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require("../config/config-nonRestricted")
const locationProvider = require("../models/locationProvider")
const { logDebug, logInfo, logRaw, yyyymmdd } = require('../services/helper.js')


// for Internal
async function getAllUsableProviders() {

    var providers = await locationProvider.find({ isActive: 1})
    
    return providers 
}


// for GETs
const showAllProviders = async (req, res) => {
    const providers = await locationProvider.find({}, {
        "isActive": 1,
        "name": 1,
        "addedAt": 1,
        "description": 1,
        "slug": 1
    }).sort({ addedAt: 'desc'})
    
    // is not slow but optimalization is better
    //const providers = await locationProvider.find().sort({ addedAt: 'desc'})
    
    res.render('providers/fullList.ejs', { providers: providers, siteTitle: 'GeoDB provider list' })
}

const newProvider = (req, res) => {
    res.render('providers/newProvider.ejs', { provider: new locationProvider(), siteTitle: 'New provider' })
}

const editProvider = async (req, res) => {
    const provider = await locationProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    res.render('providers/showProvider.ejs', { provider: provider, siteTitle: 'Edit provider' })
}

const downloadProviders = async (req, res) => {
    logInfo('Downloading providers')

    // make sure to know when was it downloaded
    const date = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}

    var text = "WhereDaIp - providers extraction\r\n"
    text += `Downloaded at: ${date.toLocaleDateString(undefined, options)}\r\n\r\n`
    const providers = await locationProvider.find().sort({ addedAt: 'desc'})
    text += JSON.stringify(providers)
    text += '\r\n'

    // name the file accordingly
    res.attachment(`WDP-Providers-${yyyymmdd()}.txt`)
    res.type('txt')
    res.send(text)
}


// for POSTs
const createNewProvider = async (req, res, next) => {
    req.provider = new locationProvider()
    next()
}

const editExistingProvider = async (req, res, next) => {
    req.provider = await locationProvider.findById(req.params.id)
    next()
}

const deleteExistingProvider = async (req, res) => {
    await locationProvider.findByIdAndDelete(req.params.id)
    res.redirect(`${configuration.WWW_GEODB_HOME}`)
}

// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let provider = req.provider

        provider.name = req.body.name
        provider.description = req.body.description

        provider.lastEditAt = new Date()
        provider.format = req.body.response_format
        provider.isFree = req.body.service_free === 'on' ? 1 : 0
        provider.isActive = req.body.service_enabled === 'on' ? 1 : 0

        provider.baseUrl = req.body.api_url
        provider.restMethod = req.body.api_method
        provider.request.ipAddress = req.body.api_req_param_ip
        provider.request.authentication = req.body.api_req_param_auth

        provider.response.successPath = req.body.api_resp_success_path
        provider.response.typePath = req.body.api_resp_iptype_path
        provider.response.continentPath = req.body.api_resp_continent_path
        provider.response.countryPath = req.body.api_resp_country_path
        provider.response.countryCodePath = req.body.api_resp_countrycode_path
        provider.response.countryFlagPath = req.body.api_resp_countryflag_path
        provider.response.regionPath = req.body.api_resp_region_path
        provider.response.cityPath = req.body.api_resp_city_path
        provider.response.latitudePath = req.body.api_resp_latitude_path
        provider.response.longitudePath = req.body.api_resp_longitude_path
        provider.response.orgPath = req.body.api_resp_organization_path
        provider.response.ispPath = req.body.api_resp_isp_path
        provider.response.currencyPath = req.body.api_resp_currency_path
        provider.response.fulfilledRequestsPath = req.body.api_resp_requestscount_path

        provider.response.asPath = req.body.api_resp_as_path
        provider.response.mobilePath = req.body.api_resp_mobile_path
        provider.response.proxyPath = req.body.api_resp_proxy_path
        provider.response.hostingPath = req.body.api_resp_hosting_path

        try {
            provider = await provider.save()
            res.redirect(`${configuration.WWW_GEODB_HOME}/${provider.slug}/?changed=1`)
        } catch (e) {
            res.render(`${configuration.WWW_GEODB_HOME}/${viewName}`, { provider: provider })
        }
    }
}


module.exports = {
    getAllUsableProviders,
    showAllProviders, newProvider, editProvider,
    createNewProvider, editExistingProvider, deleteExistingProvider,
    saveAndRedirect,
    downloadProviders
}
