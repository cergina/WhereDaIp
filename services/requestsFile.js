const { getAllUsableProviders } = require('../controllers/providersCtrl.js')

var setOfIp = []
var currentGeolocationMin = 1

const setGeolocationLimit = async () => {
    var provs = await getAllUsableProviders()
    var currentMin = undefined

    for (var p of provs) {
        if (currentMin === undefined || p.limit < currentMin)
            currentMin = p.limit
    }

    if (currentMin)
        currentGeolocationMin = currentMin
    
    return currentGeolocationMin
}

function addNewSet(newSet) {
    setOfIp = setOfIp.concat(newSet)
}


const popOneBatch = async () => {
    if (setOfIp.length === 0) {
        return null
    }

    var popped = setOfIp.shift()

    return popped
}

const getLimitAndBatchCount = async () => {
    return {batchesCount: setOfIp.length, currentLimit: currentGeolocationMin}
}

module.exports = {
    setGeolocationLimit,
    addNewSet,
    popOneBatch,
    getLimitAndBatchCount
}