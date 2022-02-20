// vsetky tagy v systeme ktore su mat
// prejst vsetkymi zoznamami v suspicions module a spocitat dokopy kolko je IP adries v zoznamoch tych tagov
// zoradit pocty
// vpisat do topTags

const { getJsonWithCountedListTags } = require("../../controllers/suspectCtrl");

var fs = require('fs');
const { date_plus_time } = require("../helper");
var folderRead = '../../public/templates/'  // starts from here
var folderWrite = './public/accessible/'    // starts from project root
var fileNameRead = 'barType.json';      // inspiration
var fileNameWrite = 'topTags.json';     // created
var file = require(folderRead + fileNameRead);

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
    //console.log("HA")

    // zorad tags podla  tag.numOfIps
    //list.sort((a, b) => (a.numOfIps < b.numOfIps) ? 1 : -1)

    //console.log("HB")
    // .type
    // .data.labels[ napisy ]
    // .data.datasets[0].label
    // .data.datasets[0].data[ cisla ]
    // .options.plugins.title.text

    // .table

    // .time
    // pridaj do  fileu, ktory zoberies z template udaje
    var graphLabels = []
    var graphLabel = "Top 5 tags"
    var graphValues = []
    var graphOptionsLabel = "Top 5 tags"

    var graphLimit = 5
    for (var tmp of list) {
        if (graphLabels.length < graphLimit) {
            graphLabels.push(tmp.tagName)
            graphValues.push(tmp.numOfIps)
        }
    }

    //console.log("HC")

    // Chart.js
    file.data.labels = graphLabels
    file.data.datasets[0].label = graphLabel
    file.data.datasets[0].data = graphValues
    file.options.plugins.title.text = graphOptionsLabel

    // Grid.js
    file.forGridJs = {}
    file.forGridJs.tableNames = ["Order", "Name", "Value"]
    file.forGridJs.tableValues = retObj.table

    // misc
    file.time = date_plus_time()

    //console.log("HD")
    // uloz do public accessible
    saveChangesToFile()

    //console.log("HE")
    // vytvor daco co dokaze odtial citat udaje o tagoch

}

const saveChangesToFile = (req, res, next) => {
    fs.writeFileSync(folderWrite + fileNameWrite, JSON.stringify(file, null, 4), function (err) {
        if (err) return console.log(err);
      });
}

module.exports = {
    onEventRun
}