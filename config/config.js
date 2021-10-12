// require dotenv and read .env file, parse content and assign to process.env
require('dotenv').config()

var config = {}

// all need to be specified here are parts of the .env file, which needs dotenv node.js library. Secret files
config.SKUSOBNA=process.env.SKUSOBNA 
config.PASS=process.env.PASS    // set-up your own password, so no one can make tons of requests without at least basic password knowledge

// data publically available
config.PORT=13000
config.USER="Maroš Čergeť"

// export for usage outside
module.exports = config;