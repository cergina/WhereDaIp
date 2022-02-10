const express = require('express')

const router = express.Router()
const controller = require('../../controllers/api/apiCtrl')


router.get('/graphs/test', controller.test)

router.get('/graphs/fake', controller.fake)


module.exports = router