const axios = require('axios')
const URL = require("url").URL;
const net = require('net')
const { logRaw, logDebug, logError, stringIsAValidUrl } = require('./helper')

// PUBLIC - URL

function sendPromise(source) {
    return new Promise((resolve, reject) => {
        var cesta = stringIsAValidUrl(source) ? source : getCorrectURI(source)

        console.log(`cesta: ${cesta}`)

        axios.get(cesta)
            .then(r => resolve(r.data))
            .catch(error => {
                reject(error)
            })
    })
}


// GET

// private functions
function getCorrectURI(source) {
    var cesta 

    // GET
    if (source.restMethod === 0)
        cesta = source.baseUrl

    logDebug(`Source Request will be on ${cesta}`)
    cesta = encodeURI(cesta)

    return cesta
}


module.exports = {
    sendPromise
}