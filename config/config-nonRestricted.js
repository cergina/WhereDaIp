// require dotenv and read .env file, parse content and assign to process.env
require('dotenv').config()

var configuration = {}

// all need to be specified here are parts of the .env file, which needs dotenv node.js library. Secret files
configuration.SKUSOBNA=process.env.SKUSOBNA 
configuration.PASS=process.env.PASS    // set-up your own password, so no one can make tons of requests without at least basic password knowledge

// debug
configuration.PRODUCTION = false
configuration.DEBUG = true

// data publically available
configuration.PORT=13000
configuration.USER="Maroš Čergeť"

// site tree (optional upgrade)
configuration.WWW_ROOT = "/"
configuration.WWW_GEODB_HOME = "/providers"
configuration.WWW_GEODB_NEW = "/providers/new"
configuration.WWW_REQ_HOME = "/requests"
configuration.WWW_REQ_NEW = "/requests/new"
configuration.WWW_APIHELP = "/api"


// export for usage outside
module.exports = configuration;