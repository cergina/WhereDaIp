const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputMapCtrl')


router.get('/', controller.crossroad)
router.get('/test', controller.test)
router.get('/testMultiple', controller.testMultiple)
router.get('/requests', controller.viewRequests)
router.get('/dridex', controller.viewDridex)
router.get('/qakbot', controller.viewQakbot)
router.get('/emotet', controller.viewEmotet)

module.exports = router