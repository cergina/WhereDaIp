// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/testingCtrl')

// manual file change TODO make automated
router.get('/test', controller.testGetChanging)
router.get('/change-test-file', controller.changeTestFile)
router.get('/time-test', controller.showTimeTest)

// dunno
router.post('/test', controller.testFunction)
router.post('/test-content-type', controller.testFunction2)


module.exports = router 