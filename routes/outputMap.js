const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputMapCtrl')


router.get('/', controller.crossroad)

router.get('/test', controller.test)
router.get('/testMultiple', controller.testMultiple)

router.get('/requests', controller.viewRequests)
router.get('/deception', controller.viewDeception)
router.get('/sus', controller.viewSus)


router.get('/dridex', controller.viewDridex)
router.get('/qakbot', controller.viewQakbot)
router.get('/emotet', controller.viewEmotet)
router.get('/trickbot', controller.viewTrickbot)

module.exports = router