const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputMapCtrl')


router.get('/', controller.crossroad)
router.get('/test', controller.test)
router.get('/testMultiple', controller.testMultiple)
router.get('/requests', controller.viewRequests)

module.exports = router