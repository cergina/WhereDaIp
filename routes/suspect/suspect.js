// route is route
const express = require('express')
const controller = require('../../controllers/suspectCtrl')
const router = express.Router()

//

// GETs
router.get('/', controller.showTags)
router.get('/providers', controller.showAllProviders)
router.get('/providers/new', controller.newSource)
router.get('/list/add', controller.addNewList)

// POSTs

// export
module.exports = router