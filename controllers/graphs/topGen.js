var fs = require('fs');
const helper = require('../../services/helper');

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'barType.json'
var fileBar = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/'
var fileNameWriteHaha = 'topHaha.json'
var fileNameWriteOrigin = 'topOrigin.json'
var fileNameWriteAs = 'topAs.json'
var fileNameWriteTypes = 'topTypes.json'
var fileNameWritePorts = 'topPorts.json'

// Individual
const { getJsonWithCountedOrigin } = require('../../controllers/ipsCtrl')

// public
const onEventGenerateFiles = async (req, res) => {
    try {
        await generateTopHaha()
        await generateTopOrigin()
        await generateTopAs()
        // await generateTopTypes()
        // await generateTopPorts()
        // TODO dalsie
    } catch (e) {
        helper.logError(`Error in topGen occured during event ${e}`)
    }
}

// private
const generateTopHaha = async (req, res) => {
    var fileTopHaha = JSON.parse(JSON.stringify(fileBar))
    fileTopHaha.nazov = 'topGen - topHaha'
    
    saveChangesToFile(folderWrite, fileNameWriteHaha, fileTopHaha)
}
const generateTopOrigin = async (req, res) => {
    var fileTopOrigin = JSON.parse(JSON.stringify(fileBar))
    fileTopOrigin.nazov = 'topGen - topOrigin'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonWithCountedOrigin() // not implemented

    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "Origin"
    var graphValues = []
    var graphOptionsLabel = "Top 5 originating countries"

    var graphLimit = 5
    for (var tmp of list) {
        // neustale pocitame dlzku zoznamu do ktoreho pridavame a ak je este miesto pridame dalsi
        if (graphLabels.length < graphLimit) {
            graphLabels.push(tmp.name)
            graphValues.push(tmp.count)
        }
    }

    fil.data.labels = graphLabels
    fil.data.datasets[0].label = graphLabel
    fil.data.datasets[0].data = graphValues
    fil.options.plugins.title.text = graphOptionsLabel

    // Grid.js
    fil.forGridJs = {}
    fil.forGridJs.tableNames = ["Order", "Country name", "Occurence"]
    fil.forGridJs.tableValues = retObj.table
    /* UNDER WORK END */ 

    saveChangesToFile(folderWrite, fileNameWriteOrigin, fileTopOrigin)
}
const generateTopAs = async (req, res) => {
    var fileTopAs = JSON.parse(JSON.stringify(fileBar))
    fileTopAs.nazov = 'topGen - topAs'
    
    saveChangesToFile(folderWrite, fileNameWriteAs, fileTopAs)
}
const generateTopTypes = async (req, res) => {
    var fileTopTypes = JSON.parse(JSON.stringify(fileBar))
    fileTopTypes.nazov = 'topGen - topTypes'
    
    saveChangesToFile(folderWrite, fileNameWriteTypes, fileTopTypes)
}
const generateTopPorts = async (req, res) => {
    var fileTopPorts = JSON.parse(JSON.stringify(fileBar))
    fileTopPorts.nazov = 'topGen - topPorts'
    
    saveChangesToFile(folderWrite, fileNameWritePorts, fileTopPorts)
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
