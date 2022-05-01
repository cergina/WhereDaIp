// did change occur
var sources =  undefined
var graphs = undefined
var maps = undefined

function graphsDone() {
    graphs = false
    maps = true
}
function mapsDone() {
    maps = false
}


function changeOccured() {
    sources = true
    console.log('nastavujem sources na true')
}
function cacheDone() {
    sources = false
    graphs = true
}
function analysisDone() {
    graphs = true
}

function isRequiredToCalcSources() {
    return sources === undefined || sources === true
}
function isRequiredToCalcGraphs() {
    return isRequiredToCalcSources() === false && 
        (graphs === undefined || graphs === true)
}
function isRequiredToCalcMaps() {
    return isRequiredToCalcSources() === false && 
        isRequiredToCalcGraphs() === false && 
        (maps === undefined || maps === true)
}

module.exports = {
    cacheDone, analysisDone, graphsDone, mapsDone,
    isRequiredToCalcSources, isRequiredToCalcGraphs, isRequiredToCalcMaps,
    changeOccured
}