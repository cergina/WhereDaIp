// require dotenv and read .env file, parse content and assign to process.env
require('dotenv').config()

var config = {}

// all need to be specified here
config.SKUSOBNA=process.env.SKUSOBNA
config.PORT=process.env.PORT

// export for usage outside
module.exports = config;