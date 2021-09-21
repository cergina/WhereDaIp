// controller is usually a callback function that corresponds to routers
// to handle requests. 

// just for / to show basic info
const welcome = (req, res) => {
    res.render('index.ejs', { name: 'Maros Cerget'})
}

module.exports = {welcome}
