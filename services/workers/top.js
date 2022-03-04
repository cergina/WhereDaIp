// vsetky tagy v systeme ktore su mat
// prejst vsetkymi zoznamami v suspicions module a spocitat dokopy kolko je IP adries v zoznamoch tych tagov
// zoradit pocty
// vpisat do topTags

const { getJsonWithCountedListTags } = require("../../controllers/suspectCtrl");

var fs = require('fs');
const helper = require('../helper');


var folderRead = '../../public/templates/'  // starts from here
var fileNameRead = 'barType.json';      // inspiration
var fileBar = require(folderRead + fileNameRead);

var folderWrite = './public/accessible/'    // starts from project root
var fileNameWrite = 'topTags.json';     // created


// public
const onEventRun = async (req, res) => {
    try {
        await seeTags()
    } catch (e) {

    }
}


// private
const seeTags = async (req, res) => {
    const retObj = await getJsonWithCountedListTags()
    const list = retObj.list    // chart.js
 
    // pridaj do  fileu, ktory zoberies z template udaje
    var graphLabels = []
    var graphLabel = "Top 5 tags"
    var graphValues = []
    var graphOptionsLabel = "Top 5 tags"

    var graphLimit = 5
    for (var tmp of list) {
        // neustale pocitame dlzku zoznamu do ktoreho pridavame a ak je este miesto pridame dalsi
        if (graphLabels.length < graphLimit) {
            graphLabels.push(tmp.tagName)
            graphValues.push(tmp.numOfIps)
        }
    }

    

    var fileWr = JSON.parse(JSON.stringify(fileBar))

    // Chart.js
    fileWr.data.labels = graphLabels
    fileWr.data.datasets[0].label = graphLabel
    fileWr.data.datasets[0].data = graphValues
    fileWr.options.plugins.title.text = graphOptionsLabel

    // Grid.js
    fileWr.forGridJs = {}
    fileWr.forGridJs.tableNames = ["Order", "Name", "Value"]
    fileWr.forGridJs.tableValues = retObj.table

    fileWr.nazov = 'top.js - seeTags'

    saveChangesToFile(folderWrite, fileNameWrite, fileWr)
}



function saveChangesToFile(whereFolder, whereName, tempFile) {
    tempFile.time = helper.date_plus_time()
    fs.writeFileSync(whereFolder + whereName, JSON.stringify(tempFile, null, 4), function (err) {
        if (err) return console.log(err);
      });
}

module.exports = {
    onEventRun
}