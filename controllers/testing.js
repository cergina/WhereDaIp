// controller is usually a callback function that corresponds to routers
// to handle requests. 

// just test purpose
const testFunction = (req, res, next) => {
    res.json({message: 'Test works correctly'})
}

// to make sure content-type works as well
const testFunction2 = (req, res, next) => {
    res.json({
        message: 'Test works correctly',
        additionalMsg: 'More complicated use case'
    })
}


module.exports = {testFunction, testFunction2}
