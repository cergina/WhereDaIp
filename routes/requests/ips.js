// route is route
const express = require('express')

const router = express.Router()
const controller = require('../../controllers/ips')

router.get('/', controller.showAllIps)
router.get('/new/', controller.makeRequestController)
router.get('/:id', controller.showResponse)

router.post('/', controller.acceptRequestController)
router.post('/delete/:id', controller.deleteExistingResponse)

module.exports = router