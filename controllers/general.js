// controller is usually a callback function that corresponds to routers
// to handle requests. 
const config = require('./../config/config.js')

// just for / to show basic info
const welcome = (req, res) => {
    res.render('index.ejs', { name: config.USER })
}

const apiInfo = (req, res) => {
    res.render('info.ejs')
}

module.exports = {welcome, apiInfo}
