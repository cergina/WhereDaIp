// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/general')

// main screen
router.get('/', controller.welcome)
router.get('/state', controller.state)
router.get('/geolocation', controller.geolocation)
router.get('/covert', controller.covert)
router.get('/suspicious', controller.suspicious)
router.get('/presentation', controller.presentation)
router.get('/faq', controller.faq)


router.get('/api', controller.apiInfo)


module.exports = router