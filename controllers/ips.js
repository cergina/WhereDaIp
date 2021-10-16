// controller is usually a callback function that corresponds to routers
// to handle requests. 

const configuration = require('../config/config-nonRestricted.js')
const net = require('net')
const { getAllUsableProviders } = require('./providers.js')
const { logDebug, logInfo, logError } = require('../services/helper.js')
const { send, sendPromise } = require('../services/apiCommunicator.js')


// GETs
const showAllIps = (req, res) => {
    res.render('requests/ips.ejs', { siteTitle: 'List of IPs'})
}

const makeRequestController = (req, res) => {
    res.render('requests/makeRequest.ejs', { siteTitle: 'New request'})
}

// POSTs
const acceptRequestController = async (req, res) => {

    if (configuration.PASS !== req.body.password_for_lookup) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?unauthorized=1`)
        return
    }

    //logInfo('I will look onto it')

    // TODO it's necessarry to clear \r\n, maybe on linux it will be only \n, will have to test
    var addresses = req.body.ip_addresses_to_lookup.split("\r\n").filter(item => item)

    //logDebug(addresses)
    
    // supports IPv4 and IPv6, but accepts only minimal like 192.168.0.1 and no 192.168.0.001
    if (! addresses.every( currentValue => net.isIP(currentValue))) {
        res.redirect(`${configuration.WWW_REQ_NEW}/?invalid=1`)
        return
    }
    
    logInfo(`I'm gonna send it`)
    
    // TODO send and process it
    try {
        var providers = await getAllUsableProviders()

        // for every address send
        addresses.forEach(address => {
            console.log(providers)
            providers.forEach(provider => {
                //send(address, provider)
                sendPromise(address, provider)
                    .then(res => console.log(res))
                    .catch(err => console.log(err))
            })
        })
    } catch (e) {
        logError(e)
    }
}

module.exports = {
    showAllIps, makeRequestController,
    acceptRequestController
}

