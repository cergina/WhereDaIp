// entry point
const config = require('./config/config.js')
const express = require('express')
const favicon = require('serve-favicon')
const path = require('path')
const testingRoutes = require('./routes/testing')
const generalRoutes = require('./routes/general')
const providersRoutes = require('./routes/providers/providers')
const ipsRequests = require('./routes/requests/ips')

var app = express()

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
//app.use(express.static(__dirname + 'public'));
//app.use('*/css',express.static('public/css'));
app.use(express.static(__dirname + '/public'));

app.set('view-engine', 'ejs')
app.use(express.json())
app.use('/', testingRoutes)
app.use('/', generalRoutes)
app.use('/providers', providersRoutes)
app.use('/requests', ipsRequests)

const listener = app.listen(config.PORT, () => {
    console.log(`Skuska config suboru: ${config.SKUSOBNA}`)
    console.log(`Server bezi na porte: ${config.PORT}`)

    //console.log(__dirname)
    //console.log(process.cwd())
})
