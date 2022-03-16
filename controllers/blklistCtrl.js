 /*
  * controller is usually a callback function that corresponds to routers  to handle requests. 
  */
 
/* imports */
const configuration = require("../config/config-nonRestricted")
const blklistProvider = require("../models/BlklistProvider")
const blklistResponse = require("../models/ResponseBlklist")
const { sendPromise } = require('../services/simpleCommunicator.js')
const { logError } = require('../services/helper.js')

/* settings */
const basePath = `${configuration.WWW_BLKLIST_HOME}`

// GETs
const showModule = async (req, res) => {
    const providers = await blklistProvider.find().sort({ addedAt: 'desc'})
    res.render(`${basePath.slice(1)}/module.ejs`, { siteTitle: 'Blocklist Module', providers: providers})
} 
const addNewSource = async (req, res) => {
    res.render(`${basePath.slice(1)}/addNewSource.ejs`, { provider: new blklistProvider(), siteTitle: 'Form to add new blocklist source'})
}
const editSource = async (req, res) => {
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    res.render('blklist/showSource.ejs', { provider: provider, siteTitle: 'Edit source' })
}
const showList = async (req, res) => {    
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    
    const list = await blklistResponse.findOne({provider: provider._id})


    renderList(req, res, list)
}
const refreshProviderList = async (req, res) => {
    const provider = await blklistProvider.findOne({ slug: req.params.slug })

    if (provider == null)
        res.redirect(`${configuration.WWW_ROOT}`)

    console.log('refreshujem list')
    try {
        
        let acquiredList = await sendPromise(provider.baseUrl)
        
        // check every IP for type and save
        acquiredList = acquiredList.split(/\r?\n/)
        let newList = []

        acquiredList.forEach(address => {
            var res = address.startsWith('#')

            if (res === true)
                return

            // now we know its not a comment
            let addParsed = address.split("\",\"")

            let temp = {}
            temp.checked = "false"
            temp.externalId = addParsed[0]
            temp.externalDate = addParsed[1]
            temp.url = addParsed[2]
            temp.urlStatus = addParsed[3]
            temp.lastOnline = addParsed[4]
            temp.tags = addParsed[6]
            temp.externalUrl = addParsed[7]

            newList.push(temp)
        })

        // will only work on urlhaus
        let objParsed = new blklistResponse()
        objParsed.checked = false

        objParsed.provider = provider._id
        objParsed.total = newList.length
        objParsed.list =  newList

        // SAVE
        await objParsed.save()
    } catch(e) {
        logError(e)
    }
    console.log('end of list refresh')

    renderList(req, res, provider)
}

// POSTs
const createNewProvider = async (req, res, next) => {
    req.provider = new blklistProvider()
    next()
}
const editExistingProvider = async (req, res, next) => {
    req.provider = await blklistProvider.findById(req.params.id)
    next()
}
const deleteExistingProvider = async (req, res) => {
    await blklistProvider.findByIdAndDelete(req.params.id)
    res.redirect(`${configuration.WWW_BLKLIST_HOME}`)
}


// Private methods
function renderList(req, res, provider) {
    res.render('basic/pureTextArea.ejs', { 
        textArea: provider,
        slug: req.params.slug,
        site: { 
            siteTitle: 'View list',
            title: 'Blocklist list',
            crumbs: [{url: "/", name: 'Home'}, {url: "/blklist", name: 'Blocklist'}, {name: 'List view'}]
        }
     })
}

/* */
// For EVENTS
const getJsonWithCountedOnline = async (req, res) => {
    var ro = []

    // ziskat cely zoznam {urlStatus}
    // zisk vsetkych poskytovatelov
    const providers = await blklistProvider.find({}, {
        "isActive": 1,
        "slug": 1
    })

    
    ro.push({"name": "online", "count": 0})
    ro.push({"name": "offline", "count": 0})
    ro.push({"name": "unknown", "count": 0})

    var countOn = 0
    var countOff = 0
    var countNA = 0

    for (var provider of providers) {
         var tmpResp = await blklistResponse.findOne({provider: provider._id},
            {
                "addedAt": 1,
                "analyzed": 1,
                "list.urlStatus": 1
            })


        for (var stat of tmpResp.list) {
            if (stat.urlStatus === 'online')
                countOn++
            else if (stat.urlStatus === 'offline')
                countOff++
            else
                countNA++
        }
    }

    ro[0].count = countOn
    ro[1].count = countOff
    ro[2].count = countNA

    // sort them
    ro.sort((a, b) => (a.count < b.count) ? 1 : -1)

    var retObj = {}
    retObj.list = ro

    // GridJs
    retObj.table = []
    var order = 1
    
    for (var tmp of ro) {
        retObj.table.push([order++, tmp.name, tmp.count])
    }

    return retObj
}
/* */





// helper - znovupouzitelnost
function saveAndRedirect(viewName) {
    return async (req, res) => {
        let provider = req.provider


        provider.name = req.body.name
        provider.description = req.body.description

        provider.lastEditAt = new Date()
        provider.format = req.body.response_format
        provider.isActive = req.body.service_enabled === 'on' ? 1 : 0
        provider.baseUrl = req.body.api_url

        provider.response.externalId = req.body.blk_resp_externalId
        provider.response.externalDate = req.body.blk_resp_externalDate
        provider.response.url = req.body.blk_resp_url
        provider.response.urlStatus = req.body.blk_resp_urlStatus
        provider.response.lastOnline = req.body.blk_resp_lastOnline
        provider.response.tags = req.body.blk_resp_tags
        provider.response.externalUrl = req.body.blk_resp_externalUrl

        console.log(provider)

        try {
            provider = await provider.save()
            console.log('ok')



            console.log('done')
            res.redirect(`${configuration.WWW_BLKLIST_HOME}/${provider.slug}/?changed=1`)
        } catch (e) {
            console.log(`chyba ${e}`)
            res.render(`${configuration.WWW_BLKLIST_HOME.slice(1)}\\${viewName}`, { siteTitle: "Provider (correction)", provider: provider, error: 1 })
        }
    }
}


// TODO
// const reportFindingsHere = async (arg) => {
//     // get this only once
//     var lists = await suspectProvider.find({}, {
//         "name": 1,
//         "slug": 1,
//         "tagList": 1,
//         "ipList": 1
//     })

//     var retArr = []

//     // zoznam zo zoznamov
//     for (var xList of lists) {
//         var processed = null
//         var previousIp = null

//         // ip adresa zo zoznamu
//         for (var xIp of arg) {
//             // porovnavat iba ak uz neni v retArr taka ip adresa ( pozor, moze byt vo viac zoznamoch preto reset processed - zaujima nas iba pre 1 list aby nebola duplikacia )
//             if (previousIp !== xIp.ipRequested) {
//                 if (xList.ipList.some(e => e.ip === xIp.ipRequested)) {
//                     previousIp = xIp.ipRequested
//                     processed = {
//                         ipRequested: xIp.ipRequested,
//                         text: `SUSPECT | ${'tags here temp'} | ${xList.slug} | ${xList.name}`,
//                         foundAt: Date.now()
//                     }

//                     retArr.push(processed)
//                 }
//             }

//         }
//     }

//     return retArr
// }

module.exports = {
    showModule, addNewSource, editSource, showList,
    createNewProvider, editExistingProvider, deleteExistingProvider, refreshProviderList,
    getJsonWithCountedOnline,
    saveAndRedirect,
    reportFindingsHere
}

