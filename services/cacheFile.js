var cachedSources = undefined
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

module.exports = {
    getCachedBloklistProviders, getCachedBloklistResponses,
    setCacheBloklistProviders, setCacheBloklistResponses,
    isCacheUsable
}