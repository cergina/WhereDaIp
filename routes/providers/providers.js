// route is route
const express = require('express')
const controller = require('../../controllers/providersCtrl')
const router = express.Router()

//

// GETs
router.get('/', controller.showAllProviders)
router.get('/new', controller.newProvider)
router.get('/download/', controller.downloadProviders)
router.get('/:slug', controller.editProvider)

// POSTs
router.post('/', controller.createNewProvider, controller.saveAndRedirect('newProvider'))
router.post('/edit/:id', controller.editExistingProvider, controller.saveAndRedirect('showProvider'))
router.post('/delete/:id', controller.deleteExistingProvider)

module.exports = router