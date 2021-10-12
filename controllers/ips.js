// controller is usually a callback function that corresponds to routers
// to handle requests. 

// to show all providers in the system
const showAllIps = (req, res) => {
    res.render('requests/ips.ejs', { siteTitle: 'List of IPs'})
}


const makeRequestController = (req, res) => {
    res.render('requests/makeRequest.ejs', { siteTitle: 'New request'})
}

module.exports = {showAllIps, makeRequestController}

