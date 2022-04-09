var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'mapBase.json'
var fileBase = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/map/'
var fileNameWriteTest = 'mapHaha.json'
var fileNameWriteRquests = 'mapRequests.json'

const { getJsonForMapRequests } = require('../../controllers/ipsCtrl')

// public
const onEventGenerateFiles = async (cacheBlkProv, cacheBlkResp) => {
    try {
        await generateMapTest()
        await generateMapRequests()
        // dalsie
    } catch (e) { 
        helper.logError(`Error in mapGen occured during event ${e}`)
    }
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
    saveChangesToFile(folderWrite, fileNameWriteRquests, fil)
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
