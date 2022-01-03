/* 
        .env file is IGNORED by .gitignore => YOU NEED TO CREATE ONE
    
    * The content of that file needs to target what you see in this file refers
            to lines as eg.:      

            "configuration.PASS=process.env.PASS"
            ^^^^^
            
            (PASS, FAKEIPV6, ...)
    * Then, in the .env file you just write "PASS=YourPassword"
*/ 

require('dotenv').config()

var configuration = {}

////////////////////////////////////////////////////////////////////////
//////////////// HAS TO BE IN .env FILE ////////////////////////////////
////////////////////////////////////////////////////////////////////////

// all need to be specified here are parts of the .env file, which needs dotenv node.js library. Secret files
configuration.SKUSOBNA=process.env.SKUSOBNA // useless, just for testing
configuration.PASS=process.env.PASS         // set-up your own password, so no one can make tons of requests without at least basic password knowledge
configuration.FAKEIPV6=process.env.FAKEIPV6 // example IPv6 address used for fake requests (if enabled)
configuration.FAKEIPV4=process.env.FAKEIPV4 // example IPv6 address used for fake requests (if enabled)

////////////////////////////////////////////////////////////////////////
////////////////// AVAILABLE FOR PUBLIC ////////////////////////////////
////////////////////////////////////////////////////////////////////////

configuration.PRODUCTION = false    // Disable INFO level msg logging
configuration.DEBUG = true          // Enable DEBUG level msg logging

configuration.PORT=13000            // this will be moved into .env in future
configuration.USER="Maroš Čergeť"   // this will be moved into .env in future


// Site tree used for navigation URLs
configuration.WWW_ROOT = "/"
configuration.WWW_GEODB_HOME = "/providers"
configuration.WWW_GEODB_NEW = "/providers/new"
configuration.WWW_REQ_HOME = "/requests"
configuration.WWW_REQ_NEW = "/requests/new"
configuration.WWW_APIHELP = "/api"


////////////////////////////////////////////////////////////////////////
////////////////// EXPORT FOR OUTSIDE USAGE ////////////////////////////
////////////////////////////////////////////////////////////////////////
module.exports = configuration;
