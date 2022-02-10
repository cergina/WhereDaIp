// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../config/config-nonRestricted.js')

// real
const crossroad = (req, res) => {
    res.render('outputs/mapCrossroad.ejs', { siteTitle: 'Maps crossroad'})
}


module.exports = {
    crossroad
}
