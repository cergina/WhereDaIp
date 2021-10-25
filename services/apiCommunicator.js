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
// everyone will be successfull, but print out same location, except of entered IP
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
            
        if (verzia) {
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

// POST app/json
function sendViaPost(ip, provider) {
    logDebug('not supported yet')
}


// private functions
function getCorrectURI(ip, provider) {
    var cesta 

    if (provider.restMethod === 0)
        cesta = sendViaGetParam(ip, provider)

    if (provider.restMethod === 1)
        cesta = sendViaGet(ip, provider)

    if (provider.restMethod === 3) 
        cesta = sendViaPost(ip, provider)

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
    
    logDebug(`Request will be on: ${cesta}`)
    
    return cesta
}

function makeUrlPure(ip, provider) {
    var cesta = provider.baseUrl

    cesta += (cesta.slice(-1) === '/') ? ip : '/' + ip
    
    logDebug(`Request will be on: ${cesta}`)
    
    return cesta
}

function makeUrlPost(ip, provider) {
    return undefined
}


module.exports = {
    sendPromise,
    sendFakePromise
}