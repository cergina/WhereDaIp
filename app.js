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

var app = express()
mongoose.connect('mongodb://localhost/wdip')

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
    console.log(`Skuska config suboru: ${configuration.SKUSOBNA}`)
    console.log(`Server bezi na porte: ${configuration.PORT}`)

    //console.log(__dirname)
    //console.log(process.cwd())
})
