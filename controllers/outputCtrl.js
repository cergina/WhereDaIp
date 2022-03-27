// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require(`../config/config-nonRestricted.js`)

const basePath = `outputs/graph/`

const test = (req, res) => {
    res.render(`${basePath}test.ejs`, { siteTitle: `Graph test`})
}

// real graphs
const crossroad = (req, res) => {
    res.render(`${basePath}graphCrossroad.ejs`, { siteTitle: `Graphs crossroad`})
}

const topOrigin = (req, res) => {

 
    res.render(`${basePath}topCountries.ejs`, { siteTitle: `Leading threat origins`})
}

const topSignatures = (req, res) => {
    
    res.render(`${basePath}topSignatures.ejs`, { siteTitle: `Leading threat signatures`})
}

const topPorts = (req, res) => {
    
    res.render(`${basePath}topPorts.ejs`, { siteTitle: `Most often used ports`})
}

const topAs = (req, res) => {
    
    res.render(`${basePath}topAs.ejs`, { siteTitle: `Leading AS\`s used`})
}

const topTags = (req, res) => {
    
    res.render(`${basePath}topTags.ejs`, { siteTitle: `IP addresses with most tags`})
}

const comparedOnline = (req, res) => {
    
    res.render(`${basePath}comparedOnline.ejs`, { siteTitle: `IPs online/offline`})
}

const comparedCovered = (req, res) => {
    
    res.render(`${basePath}comparedCovered.ejs`, { siteTitle: `Detected protection`})
}

const comparedDomain = (req, res) => {
    
    res.render(`${basePath}comparedDomain.ejs`, { siteTitle: `Comparation of IPs with(out) domain`})
}

const comparedHttps = (req, res) => {
    
    res.render(`${basePath}comparedHttps.ejs`, { siteTitle: `Comparation of URLs that use https vs http`})
}

const activity = (req, res) => {
    
    res.render(`${basePath}activity.ejs`, { siteTitle: `Historical activity`})
}

module.exports = {
    test, 
    crossroad, topOrigin, topSignatures, topPorts, topAs, topTags,
    comparedOnline, comparedCovered,  comparedDomain, comparedHttps,
    activity
}
