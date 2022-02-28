// route is route
const express = require('express')
const controller = require('../../controllers/blklistCtrl')
const router = express.Router()

//

// GETs
router.get('/', controller.showModule)
router.get('/new', controller.addNewSource)
router.get('/list/:slug', controller.showList)
router.get('/:slug', controller.editSource)


// POSTs
router.post('/', controller.createNewProvider, controller.saveAndRedirect('addNewSource'))
router.post('/edit/:id', controller.editExistingProvider, controller.saveAndRedirect('showSource'))
router.post('/delete/:id', controller.deleteExistingProvider)

// export
module.exports = router