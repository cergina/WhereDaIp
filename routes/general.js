// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/generalCtrl')

// main screen
router.get('/', controller.welcome)
router.get('/state', controller.state)
router.get('/geolocation', controller.geolocation)
router.get('/presentation', controller.presentation)
router.get('/faq', controller.faq)


module.exports = router