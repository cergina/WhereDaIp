const net = require('net')

var cachedSources = undefined

// blklist
var cachedBloklistProviders = undefined
var cachedBloklistResponses = undefined


function setCacheBloklistProviders(cacheBlklist) {
    cachedBloklistProviders = cacheBlklist

}

function setCacheBloklistResponses(cacheBlklist) {
    cachedBloklistResponses = cacheBlklist
}


function getCachedBloklistProviders() {
    if (cachedBloklistProviders)
        return cachedBloklistProviders
    else
        return []
}

function getCachedBloklistResponses() {
    if (cachedBloklistResponses)
        return cachedBloklistResponses
    else
        return []
}



function isCacheUsable() {
    return (cachedBloklistResponses && cachedBloklistProviders)
}

// IPs
var cachedGeolocatedIps = undefined
var cachedUniqueGeolocatedIps = undefined

function setCacheGeolocatedIps(cacheList) {
    cachedGeolocatedIps = cacheList
}
function setCacheUniqueGeolocatedIps(cacheList) {
    cachedUniqueGeolocatedIps = cacheList
}
function getCachedGeolocatedIps() {
    if (cachedGeolocatedIps) 
        return cachedGeolocatedIps
    else
        return []
}
function getUniqueGeolocatedIps() {
    var toRet = []
    if (cachedGeolocatedIps === undefined) {
        console.log("Wait until event SOURCE is generated first.")
        return null
    }

    for  (var x of cachedGeolocatedIps) {
        // subnet IPs
        if (x.isSubnet) {
            for (var y of x.subList) {
                if (toRet.indexOf(y.address) === -1)
                    toRet.push(y.address)    
            }
        // general IP
        } else {
            if (toRet.indexOf(x.ipRequested) === -1)
                toRet.push(x.ipRequested)
        }
    }
    return toRet
}
function getUniqueGeolocatedIpsWithType() {
    if (cachedUniqueGeolocatedIps) 
        return cachedUniqueGeolocatedIps
    else
        return []
}
const calculateUniqueGeolocatedIps =  async () => {
    var toRet = []
    var collisionCollider = []
    if (cachedGeolocatedIps === undefined) {
        console.log("Wait until event SOURCE is generated first.")
        return null
    }

    for  (var x of cachedGeolocatedIps) {
        // subnet IPs
        if (x.isSubnet) {
            for (var y of x.subList) {
                if (collisionCollider.indexOf(y.address) === -1) {
                    toRet.push({address: y.address, type: net.isIP(y.address)})
                    collisionCollider.push(y.address)
                } 
            }
        // general IP
        } else {
            if (collisionCollider.indexOf(x.ipRequested) === -1) {
                toRet.push({address: x.ipRequested, type: net.isIP(x.ipRequested)})
                collisionCollider.push(x.ipRequested)
            }
        }
    }
    return toRet
}


// ALL
function getAllCache() {
    return {cachedBloklistProviders: getCachedBloklistProviders(), 
        cachedBloklistResponses: getCachedBloklistResponses(), 
        cachedGeolocatedIps: getCachedGeolocatedIps(),
        cachedUniqueGeolocatedIps: getUniqueGeolocatedIpsWithType()
    }
}

module.exports = {
    getCachedBloklistProviders, getCachedBloklistResponses, getCachedGeolocatedIps, 
    getAllCache,
    setCacheBloklistProviders, setCacheBloklistResponses, calculateUniqueGeolocatedIps,
    isCacheUsable, 
    setCacheGeolocatedIps, getUniqueGeolocatedIps, getUniqueGeolocatedIpsWithType, setCacheUniqueGeolocatedIps
}