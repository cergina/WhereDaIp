// entry point
const configuration = require('./config/config-nonRestricted.js')
const express = require('express')
const mongoose = require('mongoose')
const favicon = require('serve-favicon')
const path = require('path')
const testingRoutes = require('./routes/testing')
const generalRoutes = require('./routes/general')
const providersRoutes = require('./routes/providers/providers')
const ipsRequests = require('./routes/requests/ips')
const bodyParser = require('body-parser')
const { logDebug, logInfo, logRaw } = require('./services/helper.js')

// if mongodb does not work, stop npm and do these steps //
// Go to Control Panel and click on Administrative Tools.
// Double click on Services. A new window opens up.
// Search MongoDB.exe. Right click on it and select Start.


mongoose.connect('mongodb://localhost/wdip')
var app = express()

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.set('views', path.join(__dirname, 'views'));

//app.use(express.static(__dirname + 'public'));
//app.use('*/css',express.static('public/css'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
//app.use(express.json()) // fetch, post (except for 'HTML post form')
app.use(express.urlencoded( {extended: false} ))
//app.use(bodyParser.json())

app.use(`${configuration.WWW_ROOT}`, testingRoutes)
app.use(`${configuration.WWW_ROOT}`, generalRoutes)
app.use(`${configuration.WWW_GEODB_HOME}`, providersRoutes)
app.use(`${configuration.WWW_REQ_HOME}`, ipsRequests)

const listener = app.listen(configuration.PORT, () => {
    logRaw(`\n\n-------------------------\n\n`)
    logRaw(`${(new Date()).toLocaleTimeString()} -- ${(new Date()).toLocaleDateString()}`)
    logRaw(`Skuska config suboru: ${configuration.SKUSOBNA}`)
    logRaw(`Server bezi na porte: ${configuration.PORT}`)

    logRaw(`\n\n-------------------------\n\n`)
    //logRaw(__dirname)
    //logRaw(process.cwd())
})
