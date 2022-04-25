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

configuration.IPSTART=process.env.IPSTART
configuration.PORT=process.env.PORT
configuration.USER=process.env.USER

// Check for Errors and SET defaults
if (typeof configuration.USER != 'string' || configuration.USER.length < 1) {
        configuration.USER="Mr. X"
}
if (typeof configuration.PORT != 'number' || configuration.PORT < 0 || configuration.PORT > 65536) {
        configuration.PORT=13000
}

if (typeof configuration.SKUSOBNA != 'string' || configuration.SKUSOBNA.length < 1) {
        configuration.SKUSOBNA="Make sure a file '.env' is created according to instructions"
}



////////////////////////////////////////////////////////////////////////
////////////////// AVAILABLE FOR PUBLIC ////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Working state
configuration.PRODUCTION = false    // Disable INFO level msg logging
configuration.DEBUG = true          // Enable DEBUG level msg logging

// Site tree used for navigation URLs
configuration.WWW_ROOT = "/"
configuration.WWW_STATE = "/state"
configuration.WWW_GEODB_HOME = "/providers"
configuration.WWW_GEODB_NEW = "/providers/new"
configuration.WWW_COVER_HOME = "/covert"
configuration.WWW_COVER_NEW = "/covert/new"
configuration.WWW_SUSPECT_HOME = "/suspect"
configuration.WWW_SUSPECT_LIST_NEW = "/suspect/list/add"
configuration.WWW_SUSPECT_PROVIDER_NEW = "/suspect/providers/new"
configuration.WWW_BLKLIST_HOME = "/blklist"
configuration.WWW_REQ_HOME = "/requests"
configuration.WWW_REQ_NEW = "/requests/new"
configuration.WWW_TEST = "/test"
configuration.WWW_GRAPH = "/graphs"
configuration.WWW_MAP = "/maps"
configuration.WWW_API = "/api"

// Events
configuration.EVENT_TEST = "event_test"
configuration.TIMER_EVENT_TEST = 16000
configuration.EVENT_GRAPH = "event_graph_update"
configuration.TIMER_EVENT_GRAPH = 30000
configuration.EVENT_MAPS = "event_maps_update"
configuration.TIMER_EVENT_MAPS = 130000
configuration.EVENT_GEOLOCATION = "event_geolocation_process"
configuration.TIMER_EVENT_GEOLOCATION = 30000
configuration.EVENT_SOURCES = "event_graph_sources"
configuration.TIMER_EVENT_SOURCES = 20000 // has to be smaller than maps and graphs


// Blocktimes in minutes (its max)
configuration.BLOCK_TIME_SOURCES = 2
configuration.BLOCK_TIME_ANALYSIS = 1
configuration.BLOCK_TIME_GEOLOCATION = 1
configuration.BLOCK_TIME_GRAPHS = 3
configuration.BLOCK_TIME_MAPS = 3

////////////////////////////////////////////////////////////////////////
////////////////// EXPORT FOR OUTSIDE USAGE ////////////////////////////
////////////////////////////////////////////////////////////////////////
module.exports = configuration;
