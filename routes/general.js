// route is route
const express = require('express')

const router = express.Router()
const controller = require('../controllers/general')

router.get('/', controller.welcome)

module.exports = router