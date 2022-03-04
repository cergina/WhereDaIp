var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'barType.json'
var fileBar = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/'
var fileNameWriteOnline = 'comparedOnline.json'


// public
const onEventGenerateFiles = async (req, res) => {
    try {
        await generateCompOnline()
        // dalsie
    } catch (e) {
        logError(`Error in compGen occured during event ${e}`)
    }
}

// private
const generateCompOnline = async (req, res) => {
    var fileComOnline = JSON.parse(JSON.stringify(fileBar))

    fileComOnline.nazov = 'compGen - comparedOnline'
    fileComOnline.time = helper.date_plus_time()
    
    saveChangesToFile(folderWrite, fileNameWriteOnline, fileComOnline)
}

function saveChangesToFile(whereFolder, whereName, tempFile) {
    fs.writeFileSync(whereFolder + whereName, JSON.stringify(tempFile, null, 4), function (err) {
        if (err) return console.log(err);
      });
}

module.exports = {
    onEventGenerateFiles
}
