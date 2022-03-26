var fs = require('fs');
const helper = require('../../services/helper');
const { getJsonWithCountedOnline, getJsonWithCountedDomainsAndHttp } = require('../../controllers/blklistCtrl')

// template
var folderRead = '../../public/templates/'
var fileNameRead = 'barType.json'
var fileBar = require(folderRead + fileNameRead);

// saves
var folderWrite = './public/accessible/'
var fileNameWriteOnline = 'comparedOnline.json'
var fileNameWriteDomain = 'comparedDomain.json'
var fileNameWriteCovered = 'comparedCovered.json'
var fileNameWriteHttps = 'comparedHttps.json'
var fileNameWriteCoveredAll = 'comparedCoveredAll.json'


// public
const onEventGenerateFiles = async (req, res) => {
    try {
        await generateCompOnline()
        await generateCompDomainAndHttp()
        // TODO dalsie
    } catch (e) {
        helper.logError(`Error in compGen occured during event ${e}`)
    }
} 

// private
const generateCompOnline = async (req, res) => {
    // Init
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = 'compGen - comparedOnline'

    const retObj = await getJsonWithCountedOnline()

    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "Online status"
    var graphValues = []
    var graphOptionsLabel = "Threat actor status"

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
    fil.forGridJs.tableNames = ["Order", "Name", "Value"]
    fil.forGridJs.tableValues = retObj.table


    // Generic
    saveChangesToFile(folderWrite, fileNameWriteOnline, fil)
}
const generateCompDomainAndHttp = async (req, res) => {
    const retObj = await getJsonWithCountedDomainsAndHttp()

    // DOM comp
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = `compGen - ${fileNameWriteDomain}`


    // Chart.js
    var list = retObj.domObj.list
    var graphLabels = []
    var graphLabel = "Domains vs No domains"
    var graphValues = []
    var graphOptionsLabel = "Ratio between IPs domain name and pure IPs"

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
    fil.forGridJs.tableNames = ["Order", "Name", "Value"]
    fil.forGridJs.tableValues = retObj.domObj.table


    // Generic
    saveChangesToFile(folderWrite, fileNameWriteDomain, fil)

    // 
    //
    // HTTP comp
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = `compGen - ${fileNameWriteHttps}`


    // Chart.js
    var list = retObj.httpObj.list
    var graphLabels = []
    var graphLabel = "https vs http"
    var graphValues = []
    var graphOptionsLabel = "Ratio between URLs that use https and unsecured http"

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
    fil.forGridJs.tableNames = ["Order", "Name", "Value"]
    fil.forGridJs.tableValues = retObj.httpObj.table


    // Generic
    saveChangesToFile(folderWrite, fileNameWriteHttps, fil)
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
