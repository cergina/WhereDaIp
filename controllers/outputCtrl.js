// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

const test = (req, res) => {
    res.render('outputs/graphicalTest.ejs', { siteTitle: 'Graph test'})
}

// real
const crossroad = (req, res) => {
    res.render('outputs/graphCrossroad.ejs', { siteTitle: 'Graphs crossroad'})
}

const topOrigin = (req, res) => {


    res.render('outputs/topCountries.ejs', { siteTitle: 'Leading threat origins'})
}

const topTypes = (req, res) => {
    
    res.render('outputs/topTypes.ejs', { siteTitle: 'Leading threat types'})
}

const topPorts = (req, res) => {
    
    res.render('outputs/topPorts.ejs', { siteTitle: 'Most often used ports'})
}

const topAs = (req, res) => {
    
    res.render('outputs/topAs.ejs', { siteTitle: 'Leading AS\'s used'})
}

const comparedOnline = (req, res) => {
    
    res.render('outputs/comparedOnline.ejs', { siteTitle: 'IPs online/offline'})
}

const comparedCovered = (req, res) => {
    
    res.render('outputs/comparedCovered.ejs', { siteTitle: 'Detected protection'})
}

const comparedDomain = (req, res) => {
    
    res.render('outputs/comparedDomain.ejs', { siteTitle: 'Comparation of IPs with(out) domain'})
}

const activity = (req, res) => {
    
    res.render('outputs/activity.ejs', { siteTitle: 'Historical activity'})
}

module.exports = {
    test, 
    crossroad, topOrigin, topTypes, topPorts, topAs,
    comparedOnline, comparedCovered,  comparedDomain,
    activity
}
