// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

// current
// just for / to show basic info
const welcome = (req, res) => {
    res.render('index.ejs', { name: configuration.USER, siteTitle: 'Home page', startedAt: configuration.STARTEDAT})
}

const state = (req, res) => {
    res.render('basic/state.ejs', { name: configuration.USER, siteTitle: 'APP state', startedAt: configuration.STARTEDAT})
}

const geolocation = (req, res) => {
    res.render('basic/geolocation.ejs', { siteTitle: 'Geolocation'})
}

const presentation = (req, res) => {
    res.render('basic/presentation.ejs', { siteTitle: 'Presentation'})
}

const faq = (req, res) => {
    res.render('basic/faq.ejs', { siteTitle: 'FAQ'})
}


module.exports = {
    welcome, state, geolocation, presentation, faq
}
