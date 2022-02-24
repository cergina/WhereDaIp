// route is route
const express = require('express')
const controller = require('../../controllers/blklistCtrl')
const router = express.Router()

//

// GETs
router.get('/', controller.showModule)
router.get('/new', controller.addNewSource)

// POSTs

// export
module.exports = router