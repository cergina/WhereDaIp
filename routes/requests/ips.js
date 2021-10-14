// route is route
const express = require('express')

const router = express.Router()
const controller = require('../../controllers/ips')

router.get('/', controller.showAllIps)
router.get('/new/', controller.makeRequestController)

router.post('/', controller.acceptRequestController)

module.exports = router