const express = require('express')

const router = express.Router()
const controller = require('../controllers/outputMapCtrl')


router.get('/', controller.crossroad)


module.exports = router