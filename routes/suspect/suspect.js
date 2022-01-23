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
router.get('/list/delete/all', controller.removeAllTagsTestOnly)
router.get('/providers/:slug', controller.editProvider)

// POSTs
router.post('/source', controller.acceptNewProvider, controller.saveAndRedirect('newProvider'))
router.post('/list', controller.acceptNewList, controller.saveAndRedirect('addList'))
router.post('/edit/:slug', controller.acceptEditExisting, controller.saveAndRedirect('editJoinedProvider'))
router.post('/providers/delete/:slug', controller.deleteExistingSource)

// export
module.exports = router