var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'mapBase.json'
var fileBase = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/map/'
var fileNameWriteTest = 'mapHaha.json'
var fileNameWriteRequests = 'mapRequests.json'
var fileNameWriteDridex = 'mapDridex.json'
var fileNameWriteEmotet = 'mapEmotet.json'
var fileNameWriteQakbot = 'mapQakbot.json'
var fileNameWriteTrickbot = 'mapTrickbot.json'

const { getLocationByCode, getGeolocCodeArrayCountsZero } = require('../../services/countries.js')
const { getJsonForMapRequests } = require('../../controllers/ipsCtrl')

// public
const onEventGenerateFiles = async (cacheBlkProv, cacheBlkResp) => {
    var funcLog
    try {
        funcLog = fileNameWriteTest
        await generateMapTest()
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteRequests
        await generateMapRequests()
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteQakbot
        await generateMapForBotnets(cacheBlkProv, cacheBlkResp)
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    // TODO dalsie
}

// private
const generateMapTest = async () => {
    var fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = 'mapGen - generateMapTest'
    

    // Generic
    saveChangesToFile(folderWrite, fileNameWriteTest, fil)
}
const generateMapRequests = async () => {
    var fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = 'mapGen - generateMapRequests'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonForMapRequests()

    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    /* UNDER WORK END */ 


    // Generic
    saveChangesToFile(folderWrite, fileNameWriteRequests, fil)
}
const generateMapForBotnets = async (cacheBlkProv, cacheBlkResp) => {
    var places = []
    for (var x of cacheBlkProv) {
        if (x.response.country && x.response.tags)
            places.push(x._id)
    }


    var arrays = {
        emotet: getGeolocCodeArrayCountsZero(),
        dridex: getGeolocCodeArrayCountsZero(),
        qakbot: getGeolocCodeArrayCountsZero(),
        trickbot: getGeolocCodeArrayCountsZero()
    }
    for (var x of cacheBlkResp) {
        if (places.find(el => el.equals(x.provider))) {
            // pozriet odpoved x ideme
            console.log('haha')
            // x.list[0].country
            // x.list[0].tags

            for (var y of x.list) {

                var kt = getLocationByCode(y.country)
                //console.log(kt)

                if (y.tags.toUpperCase().includes('EMOTET')) {
                    arrays.emotet[arrays.emotet.findIndex(el => el.code === y.country)].count++
                } else if (y.tags.toUpperCase().includes('QAKBOT')) {
                    arrays.qakbot[arrays.qakbot.findIndex(el => el.code === y.country)].count++
                } else if (y.tags.toUpperCase().includes('DRIDEX')) {
                    arrays.dridex[arrays.dridex.findIndex(el => el.code === y.country)].count++
                } else if (y.tags.toUpperCase().includes('TRICKBOT')) {
                    arrays.trickbot[arrays.trickbot.findIndex(el => el.code === y.country)].count++
                }
            }
        }
    }

    arrays.emotet = arrays.emotet.filter(a => a.count > 0)
    arrays.emotet.sort((a, b) => (a.count < b.count) ? 1 : -1)
    arrays.dridex = arrays.dridex.filter(a => a.count > 0)
    arrays.dridex.sort((a, b) => (a.count < b.count) ? 1 : -1)
    arrays.qakbot = arrays.qakbot.filter(a => a.count > 0)
    arrays.qakbot.sort((a, b) => (a.count < b.count) ? 1 : -1)
    arrays.trickbot = arrays.trickbot.filter(a => a.count > 0)
    arrays.trickbot.sort((a, b) => (a.count < b.count) ? 1 : -1)
    
    ////////////
    // EMOTET
    var fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = `mapGen - ${fileNameWriteEmotet}`

    var funcName = `Emotet`
    var retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("Country")
    retObj.fgTableNames.push("Count")
    
    for (var x of arrays.emotet) {
        retObj.points.push({
            "htmlSnippet": `<b>${funcName} origin!</b><br>Possible threat actors<br/><span style='font-size:15px;color:#999'>${x.count} in ${x.code}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        retObj.fgTableValues.push([
            funcName,
            `${x.code}`,
            `${x.count}`
        ])
    }
    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    saveChangesToFile(folderWrite, fileNameWriteEmotet, fil)

    ///////////
    // DRIDEX
    fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = `mapGen - ${fileNameWriteDridex}`
    funcName = `Dridex`
    retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("Country")
    retObj.fgTableNames.push("Count")
    
    for (var x of arrays.dridex) {
        retObj.points.push({
            "htmlSnippet": `<b>${funcName} origin!</b><br>Possible threat actors<br/><span style='font-size:15px;color:#999'>${x.count} in ${x.code}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        retObj.fgTableValues.push([
            funcName,
            `${x.code}`,
            `${x.count}`
        ])
    }
    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    saveChangesToFile(folderWrite, fileNameWriteDridex, fil)

    // QakBot
    fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = `mapGen - ${fileNameWriteQakbot}`
    funcName = `QakBot`
    retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("Country")
    retObj.fgTableNames.push("Count")
    
    for (var x of arrays.qakbot) {
        retObj.points.push({
            "htmlSnippet": `<b>${funcName} origin!</b><br>Possible threat actors<br/><span style='font-size:15px;color:#999'>${x.count} in ${x.code}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        retObj.fgTableValues.push([
            funcName,
            `${x.code}`,
            `${x.count}`
        ])
    }
    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    saveChangesToFile(folderWrite, fileNameWriteQakbot, fil)

    // TRICKBOT
    fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = `mapGen - ${fileNameWriteTrickbot}`
    funcName = `TrickBot`
    retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("Country")
    retObj.fgTableNames.push("Count")
    
    for (var x of arrays.trickbot) {
        retObj.points.push({
            "htmlSnippet": `<b>${funcName} origin!</b><br>Possible threat actors<br/><span style='font-size:15px;color:#999'>${x.count} in ${x.code}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        retObj.fgTableValues.push([
            funcName,
            `${x.code}`,
            `${x.count}`
        ])
    }
    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    saveChangesToFile(folderWrite, fileNameWriteTrickbot, fil)
}


function saveChangesToFile(whereFolder, whereName, tempFile) {
    tempFile.time = helper.date_plus_time()

    fs.writeFileSync(whereFolder + whereName, JSON.stringify(tempFile, null, 4), function (err) {
        if (err) return console.log(err);
      });
}

module.exports = {
    onEventGenerateFiles
}
