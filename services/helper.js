const configuration = require("../config/config-nonRestricted")

function logRaw(textToLog) {
    if (configuration.PRODUCTION === false) {
        console.log(textToLog)
    }
}

function logInfo(textToLog) {
    if (configuration.PRODUCTION === true) {
        
    } else {
        log('INFO', textToLog)
    }
}

function logDebug(textToLog) {
    if (configuration.DEBUG === true) {
        log('DEBUG', textToLog)
    } else {
        
    }
}

function logError(textToLog) {
    log('ERROR', textToLog)
}

function log(title, textToLog) {
    console.log(`-- ${title} --`)
    console.log(`${(new Date()).toLocaleTimeString()} -- ${(new Date()).toLocaleDateString()}`)
    console.log(``)
    console.log('  ' + textToLog)
    console.log(`$$`)
}

function yyyymmdd() {
    var x = new Date();
    var y = x.getFullYear().toString();
    var m = (x.getMonth() + 1).toString();
    var d = x.getDate().toString();
    (d.length == 1) && (d = '0' + d);
    (m.length == 1) && (m = '0' + m);
    var yyyymmdd = y + m + d;
    return yyyymmdd;
}

module.exports = {
    logInfo, logDebug, logRaw, logError,
    yyyymmdd
}