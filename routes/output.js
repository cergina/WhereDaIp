const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputCtrl')


router.get('/', controller.crossroad)
router.get('/test', controller.test)
router.get('/top/origin', controller.topOrigin)
router.get('/top/signatures', controller.topSignatures)
router.get('/top/ports', controller.topPorts)
router.get('/top/as', controller.topAs)
router.get('/top/tags', controller.topTags)
router.get('/compared/online', controller.comparedOnline)
router.get('/compared/covered', controller.comparedCovered)
router.get('/compared/domain', controller.comparedDomain)
router.get('/compared/https', controller.comparedHttps)
router.get('/activity', controller.activity)


module.exports = router