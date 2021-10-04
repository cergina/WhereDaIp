// route is route
const express = require('express')

const router = express.Router()
const controller = require('../../controllers/providers')

router.get('/', controller.showAllProviders)
router.get('/new', controller.newProvider)

module.exports = router