 /*
  * controller is usually a callback function that corresponds to routers  to handle requests. 
  */
 
/* imports */
const configuration = require("../config/config-nonRestricted")

/* settings */
const basePath = `${configuration.WWW_BLKLIST_HOME}`

// GETs
const showModule = async (req, res) => {

    res.render(`${basePath.slice(1)}/module.ejs`, { siteTitle: 'Blocklist Module'})
} 
const addNewSource = async (req, res) => {

    res.render(`${basePath.slice(1)}/addNewSource.ejs`, { siteTitle: 'Form to add new blocklist source'})
}

// POSTs



module.exports = {
    showModule, addNewSource
}



