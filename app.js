///////////////////////////
//      Entry point     //
//////////////////////////
const configuration = require('./config/config-nonRestricted.js')
const express = require('express')
const mongoose = require('mongoose')
const favicon = require('serve-favicon')
const path = require('path')
const orchestrator = require('./services/orchestrator.js')
const testingRoutes = require('./routes/testing')
const generalRoutes = require('./routes/general')
const outputRoutes = require('./routes/output.js')
const outputMapRoutes = require('./routes/outputMap.js')
const providersRoutes = require('./routes/providers/providers')
const covertRoutes = require('./routes/covert/covert')
const suspectRoutes = require('./routes/suspect/suspect')
const apiRoutes = require('./routes/api/api')
const ipsRequests = require('./routes/requests/ips')
const bodyParser = require('body-parser')
const { logDebug, logInfo, logRaw, date_plus_time, getLocalIp } = require('./services/helper.js')
const { config } = require('dotenv')

////////////////////////////
// On error see ".manual" //
////////////////////////////

mongoose.connect('mongodb://localhost/wdip')
var app = express()

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.set('views', path.join(__dirname, 'views'));

// eg.: public/accessible/testing.json accesible on URLBASE:port/accessible/testing.json
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
app.disable('view cache')

app.use(express.urlencoded( {extended: false, limit: '25mb'} ))
app.use(express.json({limit: '25mb'}))

// register routers
app.use(`${configuration.WWW_ROOT}`, testingRoutes)
app.use(`${configuration.WWW_ROOT}`, generalRoutes)
app.use(`${configuration.WWW_GEODB_HOME}`, providersRoutes)
app.use(`${configuration.WWW_COVER_HOME}`, covertRoutes)
app.use(`${configuration.WWW_SUSPECT_HOME}`, suspectRoutes)
app.use(`${configuration.WWW_REQ_HOME}`, ipsRequests)
app.use(`${configuration.WWW_GRAPH}`, outputRoutes)
app.use(`${configuration.WWW_MAP}`, outputMapRoutes)
app.use(`${configuration.WWW_API}`, apiRoutes)

// Global events for files for graphs, ...
orchestrator.setUp()


// IP, PORT
//const ip = getLocalIp()
const ip = '0.0.0.0'
const port = configuration.PORT

// put on port
const listener = app.listen(port, ip, () => {
    logRaw(`\n\n-------------------------\n\n`)
    logRaw(`${(new Date()).toLocaleTimeString()} -- ${(new Date()).toLocaleDateString()}`)
    logRaw(`Config file test: ${configuration.SKUSOBNA}`)
    logRaw(`Server on IP:PORT = ${ip}:${port} | localhost:${port} | ${getLocalIp()}:${port}`)

    configuration.STARTEDAT=`${(new Date()).toLocaleDateString()} @ ${(new Date()).toLocaleTimeString()}`

    logRaw(`\n\n-------------------------\n\n`)
})