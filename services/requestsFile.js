const { getAllUsableProviders } = require('../controllers/providersCtrl.js')

var setOfIp = []
var currentGeolocationMin = 1
var fieldsMissing = []


const setGeolocationLimit = async () => {
    var provs = await getAllUsableProviders()
    var currentMin = undefined

    fieldsMissing = []
    var responseCheck = {
        successPath: true,
        typePath: true,
        continentPath: true,
        countryPath: true,
        countryCodePath: true,
        countryFlagPath: true,
        regionPath: true,
        cityPath: true,
        latitudePath: true,
        longitudePath: true,
        orgPath: true,
        ispPath: true,
        currencyPath: true,
        fulfilledRequestsPath: true,
        asPath: true,
        mobilePath: true,
        proxyPath: true,
        hostingPath: true
    }


    for (var p of provs) {
        if (currentMin === undefined || p.limit < currentMin)
            currentMin = p.limit
        
        responseCheck.successPath = p.response.successPath !== '' ? false : responseCheck.successPath
        responseCheck.typePath = p.response.typePath !== '' ? false : responseCheck.typePath
        responseCheck.continentPath = p.response.continentPath !== '' ? false : responseCheck.continentPath
        responseCheck.countryPath = p.response.countryPath !== '' ? false : responseCheck.countryPath
        responseCheck.countryCodePath = p.response.countryCodePath !== '' ? false : responseCheck.countryCodePath
        responseCheck.countryFlagPath = p.response.countryFlagPath !== '' ? false : responseCheck.countryFlagPath
        responseCheck.regionPath = p.response.regionPath !== '' ? false : responseCheck.regionPath
        responseCheck.cityPath = p.response.cityPath !== '' ? false : responseCheck.cityPath
        responseCheck.latitudePath = p.response.latitudePath !== '' ? false : responseCheck.latitudePath
        responseCheck.longitudePath = p.response.longitudePath !== '' ? false : responseCheck.longitudePath
        responseCheck.orgPath = p.response.orgPath !== '' ? false : responseCheck.orgPath
        responseCheck.ispPath = p.response.ispPath !== '' ? false : responseCheck.ispPath
        responseCheck.currencyPath = p.response.currencyPath !== '' ? false : responseCheck.currencyPath
        responseCheck.fulfilledRequestsPath = p.response.fulfilledRequestsPath !== '' ? false : responseCheck.fulfilledRequestsPath
        responseCheck.asPath = p.response.asPath !== '' ? false : responseCheck.asPath
        responseCheck.mobilePath = p.response.mobilePath !== '' ? false : responseCheck.mobilePath
        responseCheck.proxyPath = p.response.proxyPath !== '' ? false : responseCheck.proxyPath
        responseCheck.hostingPath = p.response.hostingPath !== '' ? false : responseCheck.hostingPath
    }

    if (responseCheck.successPath) { fieldsMissing.push('successPath') }
    if (responseCheck.typePath) { fieldsMissing.push('typePath') }
    if (responseCheck.continentPath) { fieldsMissing.push('continentPath') }
    if (responseCheck.countryPath) { fieldsMissing.push('countryPath') }
    if (responseCheck.countryCodePath) { fieldsMissing.push('countryCodePath') }
    if (responseCheck.countryFlagPath) { fieldsMissing.push('countryFlagPath') }
    if (responseCheck.regionPath) { fieldsMissing.push('regionPath') }
    if (responseCheck.cityPath) { fieldsMissing.push('cityPath') }
    if (responseCheck.latitudePath) { fieldsMissing.push('latitudePath') }
    if (responseCheck.longitudePath) { fieldsMissing.push('longitudePath') }
    if (responseCheck.orgPath) { fieldsMissing.push('orgPath') }
    if (responseCheck.ispPath) { fieldsMissing.push('ispPath') }
    if (responseCheck.currencyPath) { fieldsMissing.push('currencyPath') }
    if (responseCheck.fulfilledRequestsPath) { fieldsMissing.push('fulfilledRequestsPath') }
    if (responseCheck.asPath) { fieldsMissing.push('asPath') }
    if (responseCheck.mobilePath) { fieldsMissing.push('mobilePath') }
    if (responseCheck.proxyPath) { fieldsMissing.push('proxyPath') }
    if (responseCheck.hostingPath) { fieldsMissing.push('hostingPath') }

    if (currentMin)
        currentGeolocationMin = currentMin
    
    return currentGeolocationMin
}

function addNewSet(newSet) {
    setOfIp = setOfIp.concat(newSet)
}


const popOneBatch = async () => {
    if (setOfIp.length === 0) {
        return null
    }

    var popped = setOfIp.shift()

    return popped
}

const getLimitAndBatchCount = async () => {
    return {batchesCount: setOfIp.length, currentLimit: currentGeolocationMin, fieldsMissing: fieldsMissing}
}

module.exports = {
    setGeolocationLimit,
    addNewSet,
    popOneBatch,
    getLimitAndBatchCount
}