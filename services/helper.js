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

function date_plus_time() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let hours = (date_ob.getHours()<10?'0':'') + date_ob.getHours();
    let minutes = (date_ob.getMinutes()<10?'0':'') + date_ob.getMinutes();
    let seconds = (date_ob.getSeconds()<10?'0':'') + date_ob.getSeconds();
    
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
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


function getLocalIp() {
    const os = require('os')

    const lookFor = configuration.IPSTART

    for (let addresses of Object.values(os.networkInterfaces())) {
        for (let add of addresses) {
            if (add.address.startsWith(lookFor)) {
                return add.address;
            }
        }
    }

    return '0.0.0.0'
}

module.exports = {
    logInfo, logDebug, logRaw, logError,
    stringIsAValidUrl, uniq,
    yyyymmdd, date_plus_time,
    getLocalIp
}