// route is route
const express = require('express')
const controller = require('../../controllers/providers')
const router = express.Router()

//const locationProvider = require("../../models/locationProvider")

//

// GETs
router.get('/', controller.showAllProviders)
router.get('/new', controller.newProvider)
router.get('/:slug', controller.editProvider)

// POSTs
router.post('/', controller.createNewProvider, controller.saveAndRedirect('newProvider'))



// funcs...
// function saveAndRedirect(viewName) {
//     return async (req, res) => {
//         let provider = req.provider

//         provider.name = req.body.name
        
//         try {
//             provider = await provider.save()
//             res.redirect(`/providers/${provider.slug}`)
//         } catch (e) {
//             res.render(`providers/${viewName}`, { provider: provider })
//         }
//     }
// }

module.exports = router