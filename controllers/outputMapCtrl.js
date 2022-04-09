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
 

module.exports = {
    test, testMultiple,
    crossroad,
    viewRequests
}
