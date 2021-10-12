// controller is usually a callback function that corresponds to routers
// to handle requests. 

const locationProvider = require("../models/locationProvider")

// for GETs
const showAllProviders = async (req, res) => {
    const providers = await locationProvider.find().sort({ addedAt: 'desc'})
    res.render('providers/fullList.ejs', { providers: providers })
}

const newProvider = (req, res) => {
    res.render('providers/newProvider.ejs', { provider: new locationProvider() })
}

const editProvider = async (req, res) => {
    const provider = await locationProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect('/')

    res.render('providers/showProvider.ejs', { provider: provider })
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
    res.redirect('/providers')
}

// helper
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let provider = req.provider

        provider.name = req.body.name
        provider.description = req.body.description

        provider.lastEditAt = new Date()
        provider.format = req.body.response_format
        provider.isFree = req.body.api_free
        provider.isActive = req.body.active

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

        try {
            provider = await provider.save()
            res.redirect(`/providers/${provider.slug}/?changed=1`)
        } catch (e) {
            res.render(`providers/${viewName}`, { provider: provider })
        }
    }
}


module.exports = {
    showAllProviders, newProvider, editProvider,
    createNewProvider, editExistingProvider, deleteExistingProvider,
    saveAndRedirect
}
