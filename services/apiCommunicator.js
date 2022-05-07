const axios = require('axios')
const net = require('net')
const { logRaw, logDebug, logError } = require('./helper')

// PUBLIC

function sendPromise(ip, provider) {
    return new Promise((resolve, reject) => {
        var cesta = getCorrectURI(ip, provider)
    
        axios.get(cesta)
            .then(r => resolve(r.data))
            .catch(error => {
                reject(error)
            })
    })
}


// this is so we dont waste our requests counts
// everyone will be successful, but print out same location, except of entered IP
function sendFakePromise(ip, provider) {
    return new Promise((resolve, reject) => {

        var cesta = getCorrectURI(ip, provider)
        var verzia = net.isIP(ip)
        
        if (verzia == 0) {
            reject({
                ip: ip,
                success: false
            })
        }

        logDebug(`FAKING of Sending via ${cesta}`)
        
        /*
         - change manually - 
        FAKES act like
        0 : ipwhois
        1 : ip-api
        */
        var whichFakeToUse = 1;

        if (whichFakeToUse == 0) {
            // fake of IPWHOIS.com
            resolve({
                ip: ip,
                success: true,
                type: `IPv${verzia}` ,
                continent: 'Europe',
                continent_code: 'EU',
                country: 'Slovak Republic',
                country_code: 'SK',
                country_flag: 'https://cdn.ipwhois.io/flags/sk.svg',
                country_capital: 'Bratislava',
                country_phone: '+421',
                country_neighbours: 'PL,HU,CZ,UA,AT',
                region: 'Trnava Region',
                city: 'Galanta',
                latitude: 48.1895413,
                longitude: 17.7266636,
                asn: 'AS5578',
                org: 'SWAN, a.s.',
                isp: 'SWAN, a.s.',
                timezone: 'Europe/Bratislava',
                timezone_name: 'Central European Standard Time',
                timezone_dstOffset: 0,
                timezone_gmtOffset: 3600,
                timezone_gmt: 'GMT +1:00',
                currency: 'Euro',
                currency_code: 'EUR',
                currency_symbol: '€',
                currency_rates: 0.861,
                currency_plural: 'euros',
                completed_requests: 22
            })
        } else if (whichFakeToUse == 1) {
            // fake of IP-API.com
            resolve({
                "query": "62.197.243.225",
                "status": "success",
                "continent": "Europe",
                "country": "Slovakia",
                "countryCode": "SK",
                "regionName": "Trnava",
                "city": "Trnava",
                "lat": 48.3762,
                "lon": 17.5829,
                "currency": "EUR",
                "isp": "SWAN, a.s.",
                "org": "Residential NAT",
                "as": "AS5578 SWAN, a.s.",
                "mobile": false,
                "proxy": false,
                "hosting": false
            })
        }
        
    })
}

// GET
function sendViaGet(ip, provider) {
    var cesta = makeUrlPure(ip, provider)
    return cesta
}

// GET + param
function sendViaGetParam(ip, provider) {
    var cesta = makeUrlParam(ip, provider)
    return cesta
}

function sendViaGetWithFieldsAfterIp(ip, provider, fieldsName) {
    var cesta = makeUrlPure(ip, provider)
    cesta += `?${fieldsName}=`
    
    // iterate over the keys in response of location provider
    var testJson = provider.response
    //logDebug(testJson)

    Object.entries(testJson).forEach((entry) => {
        const [key, value] = entry
        if (value && value.length > 0) {
            cesta += `${value},`
        }
    })

    //logDebug(cesta)

    // remove last ,
    cesta = cesta.slice(0, -1)

    return cesta
}

// POST app/json
function sendViaPost(ip, provider) {
    logDebug('not supported yet')
}


// private functions
function getCorrectURI(ip, provider) {
    var cesta 

    // GET - used by ipwhois.com
    if (provider.restMethod === 0)
        cesta = sendViaGetParam(ip, provider)

    if (provider.restMethod === 1)
        cesta = sendViaGet(ip, provider)

    // POST - not implemented
    if (provider.restMethod === 2) 
        cesta = sendViaPost(ip, provider)

    // GET - for IP-API that has ?fields={} after
    if (provider.restMethod === 3)
        cesta = sendViaGetWithFieldsAfterIp(ip, provider, 'fields')

    logDebug(`Request will be on ${cesta}`)
    cesta = encodeURI(cesta)

    return cesta
}

function makeUrlParam(ip, provider) {
    var cesta = provider.baseUrl

    // evaluates to true if not null, undefined, NaN, "", 0, false
    if (provider.request.ipAddress) {
        // if last char is / replace with ?
        cesta = cesta.replace(/\/$/, "?")

        cesta += (cesta.slice(-1) === '?') ? '' : '?'

        cesta += provider.request.ipAddress
        cesta += (cesta.slice(-1) === '=') ? ip : '=' + ip
    }
    
    return cesta
}

function makeUrlPure(ip, provider) {
    var cesta = provider.baseUrl

    cesta += (cesta.slice(-1) === '/') ? ip : '/' + ip
    
    return cesta
}

function makeUrlPost(ip, provider) {
    return undefined
}


module.exports = {
    sendPromise,
    sendFakePromise
}