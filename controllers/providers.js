// controller is usually a callback function that corresponds to routers
// to handle requests. 

const locationProvider = require("../models/locationProvider")

// to show all providers in the system
const showAllProviders = (req, res) => {
    res.render('providers/fullList.ejs')
}

const newProvider = (req, res) => {
    res.render('providers/newProvider.ejs', { provider: new locationProvider() })
}

module.exports = {showAllProviders, newProvider}
