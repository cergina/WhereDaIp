var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'barType.json'
var fileBar = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/'
var fileNameWriteOnline = 'topHaha.json'


// public
const onEventGenerateFiles = async (req, res) => {
    try {
        await generateTopHaha()
    } catch (e) {
        logError(`Error in topGen occured during event ${e}`)
    }
}

// private
const generateTopHaha = async (req, res) => {
    var fileTopHaha = JSON.parse(JSON.stringify(fileBar))

    fileTopHaha.nazov = 'topGen - topHaha'
    fileTopHaha.time = helper.date_plus_time()
    
    saveChangesToFile(folderWrite, fileNameWriteOnline, fileTopHaha)
}

function saveChangesToFile(whereFolder, whereName, tempFile) {
    fs.writeFileSync(whereFolder + whereName, JSON.stringify(tempFile, null, 4), function (err) {
        if (err) return console.log(err);
      });
}

module.exports = {
    onEventGenerateFiles
}
