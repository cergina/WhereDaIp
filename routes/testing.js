// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/testingCtrl')

// manual file change TODO make automated
router.get('/change-test-file', controller.changeTestFile) 

// dunno
router.post('/test', controller.testFunction)
router.post('/test-content-type', controller.testFunction2)


module.exports = router 