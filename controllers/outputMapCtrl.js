// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

const basePath = `outputs/maps/`

const test = (req, res) => {
    res.render(`${basePath}test.ejs`, { siteTitle: 'Map test'})
}

// real
const crossroad = (req, res) => {
    res.render(`${basePath}mapCrossroad.ejs`, { siteTitle: 'Maps crossroad'})
} 
 

module.exports = {
    test,
    crossroad
}
