// route is route
const express = require('express')

const router = express.Router()
const controller = require('../../controllers/ips')

router.get('/', controller.showAllIps)

module.exports = router