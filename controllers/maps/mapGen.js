var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'barType.json'
var fileBar = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/map/'
var fileNameWriteOnline = 'mapHaha.json'


// public
const onEventGenerateFiles = async (req, res) => {
    try {
        await generateMapTest()
        // dalsie
    } catch (e) {
        helper.logError(`Error in mapGen occured during event ${e}`)
    }
}

// private
const generateMapTest = async (req, res) => {
    var fileMapTest = JSON.parse(JSON.stringify(fileBar))

    fileMapTest.nazov = 'mapGen - generateMapTest'
    
    saveChangesToFile(folderWrite, fileNameWriteOnline, fileMapTest)
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
