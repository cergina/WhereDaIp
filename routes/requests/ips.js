// route is route
const express = require('express')

const router = express.Router()
const controller = require('../../controllers/ipsCtrl')

// get
router.get('/', controller.showAllIps)
router.get('/new/', controller.makeRequestController)
router.get('/filtered', controller.showFilteredIps)
router.get('/download/', controller.downloadResponses)
router.get('/analyse/', controller.analyseIps)
router.get('/testmap/', controller.showTestMap)
router.get('/:id', controller.showResponse) // id's parameters always LAST, or else cast error will be shown
router.get('/filtered/:ipRequested', controller.showFusedResponse) // id's parameters always LAST, or else cast error will be shown

// post
router.post('/', controller.acceptRequestController)
router.post('/delete/:id', controller.deleteExistingResponse)

// privates


// exports
module.exports = router