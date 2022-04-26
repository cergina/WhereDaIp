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
var fileNameWriteTopSignatures = 'mapTopSignatures.json'
var fileNameWriteSusTags = 'mapTopSusTags.json'
var fileNameWriteHideouts = 'mapTopHideouts.json'

const { getLocationByCode, getGeolocCodeArrayCountsZero } = require('../../services/countries.js')
const { getJsonForMapRequests } = require('../../controllers/ipsCtrl')

const graphCache = require('../../services/graphOutputCache.js')

// public
const onEventGenerateFiles = async (cached) => {
    var funcLog
    try {
        funcLog = fileNameWriteTest
        await generateMapTest()
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteRequests
        await generateMapRequests(cached)
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteQakbot
        await generateMapForBotnets(cached)
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteHideouts
        await generateMapForHideouts(cached)
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteSusTags
        await generateMapForSusTags(cached)
    } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    // try {
    //     funcLog = fileNameWriteTopSignatures
    //     await generateMapForTopSignatures(cached)
    // } catch (e) {helper.logError(`Error in mapGen - ${funcLog} - occured during event ${e}`)}
    // TODO dalsie
}

// private
const generateMapTest = async () => {
    var fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = 'mapGen - generateMapTest'
    

    // Generic
    saveChangesToFile(folderWrite, fileNameWriteTest, fil)
}
const generateMapRequests = async (cached) => {
    var fil = JSON.parse(JSON.stringify(fileBase))
    fil.nazov = 'mapGen - generateMapRequests'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonForMapRequests(cached)

    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    /* UNDER WORK END */ 


    // Generic
    saveChangesToFile(folderWrite, fileNameWriteRequests, fil)
}
const generateMapForBotnets = async (cached) => {
    var places = []
    for (var x of cached.cachedBloklistProviders) {
        if (x.response.country && x.response.tags)
            places.push(x._id)
    }
    

    var arrays = {
        emotet: getGeolocCodeArrayCountsZero(),
        dridex: getGeolocCodeArrayCountsZero(),
        qakbot: getGeolocCodeArrayCountsZero(),
        trickbot: getGeolocCodeArrayCountsZero()
    } 
    for (var x of cached.cachedBloklistResponses) {
        if (places.find(el => el.equals(x.provider))) {
            // pozriet odpoved x ideme
            // x.list[0].country
            // x.list[0].tags

            for (var y of x.list) {

                //var kt = getLocationByCode(y.country)
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
    
    // EMOTET
    botnetFileProcessAndSave(fileBase, fileNameWriteEmotet, 'Emotet', arrays.emotet)
    
    // DRIDEX
    botnetFileProcessAndSave(fileBase, fileNameWriteDridex, 'Dridex', arrays.dridex)
    
    // QakBot
    botnetFileProcessAndSave(fileBase, fileNameWriteQakbot, 'QakBot', arrays.qakbot)
    
    // TRICKBOT
    botnetFileProcessAndSave(fileBase, fileNameWriteTrickbot, 'TrickBot', arrays.trickbot)
}

const generateMapForHideouts = async (cached) => {
    var hids = graphCache.getTopHideouts()

    var noOfFiles = hids.length

    for (let i=0; i< noOfFiles; i++) {
        hids[i].occurences = getGeolocCodeArrayCountsZero()
    }

    if (noOfFiles === 0) {
        console.log(`Wait for one more iteration. generateMapForHideouts has noOfFiles === 0`)
        return
    }
    console.log(hids)

    // najdi krajiny pre kazdy top hideout
    

    console.log(hids)
}
const generateMapForSusTags = async (cached) => {
    var hids = graphCache.getTopSusTags()

    var noOfFiles = hids.length

    for (let i=0; i< noOfFiles; i++) {
        hids[i].occurences = getGeolocCodeArrayCountsZero()
    }

    if (noOfFiles === 0) {
        console.log(`Wait for one more iteration. generateMapForSusTags has noOfFiles === 0`)
        return
    }

    console.log(hids)

    // as
    

    console.log(hids)
}

/* GOOD but not every blocklist has country without prior geolocation so this would only work 
as another botnet file generator, rather make top tags from suspicious lists and look in 
geolocated files */
// const generateMapForTopSignatures = async (cached) => {
//     // ziskaj top tagy z topSignatures z grafov
//     // prejdi vsetky blocklisty a najdi v nich includes ten tag, ak je... zvys occurence
//     var sigs = graphCache.getTopSignatures()

//     var noOfFiles = sigs.length

//     for (let i=0; i< noOfFiles; i++) {
//         sigs[i].occurences = getGeolocCodeArrayCountsZero()
//     }

//     console.log(sigs)

//     // najdi krajiny pre kazdy top signature
//     for (var x of cached.cachedBloklistResponses) {
//         for (var y of x.list) {

//             var kt = getLocationByCode(y.country)

//             // pre vsetky z top tagov najdi krajinu a zvys
//             for (let i = 0; i <noOfFiles; i++) {
//                 if (y.tags.toUpperCase().includes(sigs[i].name.toUpperCase())) {
//                     sigs[i].occurences[sigs[i].occurences.findIndex(el => el.code === y.country)].count++
//                 }
//             }
//         }
//     }

//     console.log(sigs)
// }

function botnetFileProcessAndSave(baseFile, argFileWriteName, argName, argArr) {
    var fil = JSON.parse(JSON.stringify(baseFile))
    fil.nazov = `mapGen - ${argFileWriteName}`
    var retObj = {points: [], fgTableNames: [], fgTableValues: []} 
    
    retObj.fgTableNames.push("Reason")
    retObj.fgTableNames.push("Country")
    retObj.fgTableNames.push("Count")
    
    for (var x of argArr) {
        retObj.points.push({
            "htmlSnippet": `<b>${argName} origin!</b><br>Possibly originating country of threat actors<br/><span style='font-size:15px;color:#999'>${x.count} IP address(es) in ${x.code} - ${x.name}</span>`,
            "lat": x.latitude,
            "lon": x.longitude
        })
        retObj.fgTableValues.push([
            argName,
            `${x.code} - ${x.name}`,
            `${x.count}`
        ])
    }
    fil.points = retObj.points
    fil.forGridJs.tableNames = retObj.fgTableNames
    fil.forGridJs.tableValues = retObj.fgTableValues
    saveChangesToFile(folderWrite, argFileWriteName, fil)
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
