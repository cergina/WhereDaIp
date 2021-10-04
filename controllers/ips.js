// controller is usually a callback function that corresponds to routers
// to handle requests. 

// to show all providers in the system
const showAllIps = (req, res) => {
    res.render('requests/ips.ejs')
}

module.exports = {showAllIps}

