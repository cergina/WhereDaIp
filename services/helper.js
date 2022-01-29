const configuration = require("../config/config-nonRestricted")
const URL = require("url").URL;

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
    console.log(`\n-- ${title} --`)
    console.log(`${(new Date()).toLocaleTimeString()} -- ${(new Date()).toLocaleDateString()}`)
    console.log(``)
    console.log('  ' + textToLog)
    console.log(`$$ END OF LOG $$\n`)
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
const stringIsAValidUrl = (s) => {
    try {
      new URL(s);
      return true;
    } catch (err) {
      return false;
    }
};

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

module.exports = {
    logInfo, logDebug, logRaw, logError,
    stringIsAValidUrl, uniq,
    yyyymmdd
}