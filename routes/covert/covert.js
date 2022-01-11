// route is route
const express = require('express')
const controller = require('../../controllers/covertCtrl')
const router = express.Router()

//

// GETs
router.get('/', controller.showAllSources)
router.get('/new', controller.newSource)
router.get('/:slug', controller.editSource)

// POSTs
router.post('/', controller.createNewSource, controller.saveAndRedirect('newSource'))
router.post('/edit/:slug', controller.editExistingSource, controller.saveAndRedirect('showSource'))
router.post('/obtain/:slug', controller.obtainSourceList, controller.appendAndRedirect('showSource'))
router.post('/clear/:slug', controller.clearSourceList, controller.appendAndRedirect('showSource'))
router.post('/delete/:id', controller.deleteExistingSource)

module.exports = router