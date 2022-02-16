const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputMapCtrl')


router.get('/', controller.crossroad)
router.get('/test', controller.test)

module.exports = router