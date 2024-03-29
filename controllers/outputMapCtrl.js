// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

const basePath = `outputs/maps/`

const test = (req, res) => {
    res.render(`${basePath}test.ejs`, { siteTitle: 'Map test'})
}

const testMultiple = (req, res) => {
    res.render(`${basePath}testMultiple.ejs`, { siteTitle: 'Map test with multiple points'})
}

// real
const crossroad = (req, res) => {
    res.render(`${basePath}mapCrossroad.ejs`, { siteTitle: 'Maps crossroad'})
} 
const viewRequests = (req, res) => { 
    res.render(`${basePath}viewRequests.ejs`, { siteTitle: 'Map showing geolocated IPs'})
}
const viewDeception = (req, res) => { 
    res.render(`${basePath}viewDeception.ejs`, { siteTitle: 'Categorized map - detected evasive techniques'})
}
const viewSus = (req, res) => { 
    res.render(`${basePath}viewSus.ejs`, { siteTitle: 'Categorized map - tags'})
}
const viewDridex = (req, res) => { 
    res.render(`${basePath}viewDridex.ejs`, { siteTitle: 'Dridex'})
}
const viewEmotet = (req, res) => { 
    res.render(`${basePath}viewEmotet.ejs`, { siteTitle: 'Emotet'})
}
const viewQakbot = (req, res) => { 
    res.render(`${basePath}viewQakbot.ejs`, { siteTitle: 'QakBot'})
}
const viewTrickbot = (req, res) => { 
    res.render(`${basePath}viewTrickbot.ejs`, { siteTitle: 'TrickBot'})
}
 
module.exports = {
    test, testMultiple,
    crossroad,
    viewRequests, viewSus, viewDeception, 
    viewDridex, viewQakbot, viewEmotet, viewTrickbot
}
