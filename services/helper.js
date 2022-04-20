const configuration = require("../config/config-nonRestricted")
const URL = require("url").URL;
const net = require('net')

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

function getSubnetForIp(ipAddress, subnetMask) {
    if (!net.isIPv4(ipAddress)) {
        LogError(`${ipAddress} is not a valid IPv4 address, therefore its mask wont be calculated.`)
        return undefined
    }

    if (subnetMask < 0 || subnetMask > 32) {
        LogError(`${subnetMask} is not a valid IPv4 mask in CIDR notation. Use 0 - 32.`)
        return undefined
    }
    
    
    var mod = subnetMask % 8
    var div = Math.floor(subnetMask / 8)

    var res0 = 0
    var res1 = res0
    var res2 = res0
    var res3 = res0
    
    var octets = ipAddress.split('.')
    var oct0 = octets[0]
    var oct1 = octets[1]
    var oct2 = octets[2]
    var oct3 = octets[3]

    if (div > 0)
        res0 = 255
    if (div > 1)
        res1 = 255
    if (div > 2)
        res2 = 255
    if (div > 3)
        res3 = 255
    
    var builded = 0
    if (mod > 0) {
        for (let i=0; i<mod; i++) {
            builded += Math.pow(2, 7-i)
        }
    }
    
    if (div === 0)
        res0 = builded
    if (div === 1)
        res1 = builded
    if (div === 2)
        res2 = builded
    if (div === 3)
        res3 = builded

    oct0 &= res0
    oct1 &= res1
    oct2 &= res2
    oct3 &= res3

    return `${oct0}.${oct1}.${oct2}.${oct3}`
}


module.exports = {
    logInfo, logDebug, logRaw, logError,
    stringIsAValidUrl, uniq,
    yyyymmdd, date_plus_time,
    getLocalIp, getSubnetForIp
}