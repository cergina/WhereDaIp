// entry point
const config = require('./config/config.js')
const express = require('express')
const testingRoutes = require('./routes/testing')
const generalRoutes = require('./routes/general')

const app = express()

app.set('view-engine', 'ejs')
app.use(express.json())
app.use('/', testingRoutes)
app.use('/', generalRoutes)

const listener = app.listen(config.PORT, () => {
    console.log(`Skuska config suboru: ${config.SKUSOBNA}`)
    console.log(`Server bezi na porte: ${config.PORT}`)
})
