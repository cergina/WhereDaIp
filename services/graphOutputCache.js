var maxTopValue = 8

var topSignatures = undefined
var topSusTags = undefined
var topHideouts = undefined

/* general */
function getMaxTopValue() {
    return maxTopValue
}

/* specific setters */
function setTopSignatures(arg) {
    if (arg && arg.length > 0) {
        topSignatures = []
        let max = (maxTopValue < arg.length) ? maxTopValue : arg.length
        for (var i = 0; i < max; i++) {
            topSignatures.push({'name': arg[i].name, 'count': arg[i].count})
        }
    }
}
function setTopSusTags(arg) {
    if (arg && arg.length > 0) {
        topSusTags = []
        // todo this cant stay like this
        let max = (maxTopValue + 10 < arg.length) ? maxTopValue : arg.length
        for (var i = 0; i < max; i++) {
            topSusTags.push({'name': arg[i].tagName, 'count': arg[i].numOfIps})
        }
    }
}
function setTopHideouts(arg) {
    if (arg && arg.length > 0) {
        topHideouts = []
        let max = (maxTopValue < arg.length) ? maxTopValue : arg.length
        for (var i = 0; i < max; i++) {
            topHideouts.push({'name': arg[i].name, 'count': arg[i].count})
        }
    }
}


/* specific getters */ 
function getTopSignatures() {
    if (topSignatures)
        return topSignatures
    else
        return []
}
function getTopSusTags() {
    if (topSusTags)
        return topSusTags
    else
        return []
}
function getTopHideouts() {
    if (topHideouts)
        return topHideouts
    else
        return []
}

// ALL
function getWholeCache() {
    return {
        topSignatures: getTopSignatures(),
        topSusTags: getTopSusTags(),
        topHideouts: getTopHideouts()
    }
}

module.exports = {
    setTopSignatures, setTopSusTags, setTopHideouts,
    getTopSignatures, getTopSusTags, getTopHideouts,
    getWholeCache, 
    getMaxTopValue,
}