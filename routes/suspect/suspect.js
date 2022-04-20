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
router.get('/geolocate/:slug', controller.geolocateProvider)
router.get('/providers/:slug', controller.editProvider)

// POSTs
router.post('/source', controller.acceptNewProvider, controller.saveAndRedirectTest('newProvider'))
router.post('/list', controller.acceptNewList, controller.saveAndRedirectTest('addList'))
router.post('/edit/:slug', controller.acceptEditExisting, controller.saveAndRedirectTest('editJoinedProvider'))
router.post('/providers/delete/:slug', controller.deleteExistingSource)

// export
module.exports = router