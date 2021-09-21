// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/testing')

router.post('/test', controller.testFunction)
router.post('/test-content-type', controller.testFunction2)


module.exports = router