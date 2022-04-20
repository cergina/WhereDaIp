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

function setCacheGeolocatedIps(cacheList) {
    cachedGeolocatedIps = cacheList
}
function getUniqueGeolocatedIps() {
    var toRet = []
    if (cachedGeolocatedIps === undefined) {
        console.log("Wait until event SOURCE is generated first.")
        return toRet
    }

    for  (var x of cachedGeolocatedIps) {
        if (toRet.findIndex(i => i === x.ipRequested) === -1)
            toRet.push(x.ipRequested)
    }
    return toRet
}

module.exports = {
    getCachedBloklistProviders, getCachedBloklistResponses,
    setCacheBloklistProviders, setCacheBloklistResponses,
    isCacheUsable, 
    setCacheGeolocatedIps, getUniqueGeolocatedIps
}