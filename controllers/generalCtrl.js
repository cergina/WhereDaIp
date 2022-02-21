// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

const basePath = `basic/`


// just for / to show basic redirects, possibly some info later
const welcome = (req, res) => {
    res.render('index.ejs', { name: configuration.USER, siteTitle: 'Home page', startedAt: configuration.STARTEDAT})
}
const state = (req, res) => {
    res.render(`${basePath}state.ejs`, { name: configuration.USER, siteTitle: 'APP state', startedAt: configuration.STARTEDAT})
}
const geolocation = (req, res) => {
    res.render(`${basePath}geolocation.ejs`, { siteTitle: 'Geolocation'})
}
const presentation = (req, res) => {
    res.render(`${basePath}presentation.ejs`, { siteTitle: 'Presentation'})
}
const faq = (req, res) => {
    res.render(`${basePath}faq.ejs`, { siteTitle: 'FAQ'})
}

module.exports = {
    welcome, state, geolocation, presentation, faq
}
