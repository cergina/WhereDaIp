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
var fileNameWriteSignatures = 'topSignatures.json'
var fileNameWritePorts = 'topPorts.json'
 
// Individual
const { getJsonWithCountedOrigin, getJsonWithCountedAs } = require('../../controllers/ipsCtrl')
const { getJsonWithCountedPorts, getJsonWithCountedSignatures } = require('../../controllers/blklistCtrl')

// public
const onEventGenerateFiles = async (cacheBlkProv, cacheBlkResp) => {
    var funcLog = 'Haha'
    try {
        await generateTopHaha()
    } catch (e) {
        helper.logError(`Error in topGen - ${funcLog} - occured during event ${e}`)
    }
    try {
        funcLog = 'Origin'
        await generateTopOrigin(cacheBlkProv, cacheBlkResp)
    } catch (e) {
        helper.logError(`Error in topGen - ${funcLog} - occured during event ${e}`)
    }
    try {
        funcLog = 'AS'
        await generateTopAs(cacheBlkProv, cacheBlkResp)
    } catch (e) {
        helper.logError(`Error in topGen - ${funcLog} - occured during event ${e}`)
    }
    try {
        funcLog = 'Signatures'
        await generateTopSignatures(cacheBlkProv, cacheBlkResp)
    } catch (e) {
        helper.logError(`Error in topGen - ${funcLog} - occured during event ${e}`)
    }
    try {
        funcLog = 'Ports'
        await generateTopPorts(cacheBlkProv, cacheBlkResp)
    } catch (e) {
        helper.logError(`Error in topGen - ${funcLog} - occured during event ${e}`)
    }
}

// private
const generateTopHaha = async () => {
    var fileTopHaha = JSON.parse(JSON.stringify(fileBar))
    fileTopHaha.nazov = 'topGen - topHaha'
    
    saveChangesToFile(folderWrite, fileNameWriteHaha, fileTopHaha)
}
const generateTopOrigin = async (cacheBlkProv, cacheBlkResp) => {
    var fileTopOrigin = JSON.parse(JSON.stringify(fileBar))
    fileTopOrigin.nazov = 'topGen - topOrigin'
     
    /* UNDER WORK START */ 
    var retObj = await getJsonWithCountedOrigin(cacheBlkProv, cacheBlkResp)

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

    fileTopOrigin.data.labels = graphLabels
    fileTopOrigin.data.datasets[0].label = graphLabel
    fileTopOrigin.data.datasets[0].data = graphValues
    fileTopOrigin.options.plugins.title.text = graphOptionsLabel

    // Grid.js
    fileTopOrigin.forGridJs = {}
    fileTopOrigin.forGridJs.tableNames = ["Order", "Country name", "Occurence"]
    fileTopOrigin.forGridJs.tableValues = retObj.table
    /* UNDER WORK END */ 

    saveChangesToFile(folderWrite, fileNameWriteOrigin, fileTopOrigin)
}
const generateTopAs = async (cacheBlkProv, cacheBlkResp) => {
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = 'topGen - topAs'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonWithCountedAs(cacheBlkProv, cacheBlkResp)

    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "AS"
    var graphValues = []
    var graphOptionsLabel = "Top 5 originating Autonomous systems"

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
    fil.forGridJs.tableNames = ["Order", "AS Name", "Occurence"]
    fil.forGridJs.tableValues = retObj.table
    /* UNDER WORK END */ 

    saveChangesToFile(folderWrite, fileNameWriteAs, fil)
}
const generateTopSignatures = async (cacheBlkProv, cacheBlkResp) => {
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = 'topGen - topSignatures'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonWithCountedSignatures(cacheBlkProv, cacheBlkResp)

    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "Signatures"
    var graphValues = []
    var graphOptionsLabel = "Top 5 attack signatures"
    
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
    fil.forGridJs.tableNames = ["Order", "Signature name", "Occurence"]
    var tableLimit = 500
    fil.forGridJs.tableValues = []
    for (var tmp of retObj.table) {
        if (fil.forGridJs.tableValues.length < tableLimit) {
            fil.forGridJs.tableValues.push(tmp)
        }
    }
    /* UNDER WORK END */ 

    saveChangesToFile(folderWrite, fileNameWriteSignatures, fil)
}
const generateTopPorts = async (cacheBlkProv, cacheBlkResp) => {
    var fil = JSON.parse(JSON.stringify(fileBar))
    fil.nazov = 'topGen - topPorts'
    
    /* UNDER WORK START */ 
    var retObj = await getJsonWithCountedPorts(cacheBlkProv, cacheBlkResp)

    // Chart.js
    var list = retObj.list
    var graphLabels = []
    var graphLabel = "Ports"
    var graphValues = []
    var graphOptionsLabel = "Top 5 misused ports"
    
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
    fil.forGridJs.tableNames = ["Order", "Port number", "Occurence"]
    var tableLimit = 500
    fil.forGridJs.tableValues = []
    for (var tmp of retObj.table) {
        if (fil.forGridJs.tableValues.length < tableLimit) {
            fil.forGridJs.tableValues.push(tmp)
        }
    }
    /* UNDER WORK END */ 

    saveChangesToFile(folderWrite, fileNameWritePorts, fil)
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
