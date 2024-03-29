var fs = require('fs');
const helper = require('../../services/helper');
const { getJsonWithCountedOnline, getJsonWithCountedDomainsAndHttp } = require('../../controllers/blklistCtrl')
const { getJsonWithCountedCovered } = require('../../controllers/ipsCtrl')

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
const onEventGenerateFiles = async (cached) => {
    var funcLog
    try {
        funcLog = fileNameWriteOnline
        await generateCompOnline(cached)
    } catch (e) {helper.logError(`Error in compGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteDomain
        await generateCompDomainAndHttp(cached)
    } catch (e) {helper.logError(`Error in compGen - ${funcLog} - occured during event ${e}`)}
    try {
        funcLog = fileNameWriteCovered
        await generateCompCovered(cached)
    } catch (e) {helper.logError(`Error in compGen - ${funcLog} - occured during event ${e}`)}
} 

// private
const generateCompOnline = async (cached) => {
    // Init
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = 'compGen - comparedOnline'

    const retObj = await getJsonWithCountedOnline(cached)

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
const generateCompDomainAndHttp = async (cached) => {
    const retObj = await getJsonWithCountedDomainsAndHttp(cached)

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
const generateCompCovered = async (cached) => {
    const retObj = await getJsonWithCountedCovered(cached)

    // DOM comp
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = `compGen - ${fileNameWriteCovered}`


    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "Comparation of privacy techniques"
    var graphValues = []
    var graphOptionsLabel = "Ratio between techniques used to fake its location"

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
    saveChangesToFile(folderWrite, fileNameWriteCovered, fil)
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
