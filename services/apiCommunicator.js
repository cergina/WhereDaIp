const axios = require('axios')
const { logRaw, logDebug, logError } = require('./helper')

// PUBLIC

function sendPromise(ip, provider) {
    return new Promise((resolve, reject) => {
        var cesta

        if (provider.restMethod === 0)
            cesta = sendViaGetParam(ip, provider)
    
        if (provider.restMethod === 1)
            cesta = sendViaGet(ip, provider)
    
        if (provider.restMethod === 3) 
            cesta = sendViaPost(ip, provider)
    
        //
    
        cesta = encodeURI(cesta)
    
        axios.get(cesta)
            .then(r => resolve(r.data))
            .catch(error => {
                reject(error)
            })
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
    sendPromise
}