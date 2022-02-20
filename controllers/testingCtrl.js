// controller is usually a callback function that corresponds to routers
// to handle requests. 

const { logDebug, logRaw, date_plus_time } = require("../services/helper")
var fs = require('fs');
var folderRead = '../public/accessible/'
var folderWrite = './public/accessible/'
var fileName = 'testing.json';
var file = require(folderRead + fileName);

// just test purpose
const testFunction = (req, res, next) => {
    res.json({message: 'Test works correctly'})
}

const showTimeTest = (req, res, next) => {
    res.json({message: 'Time test'})
    //intervalId
}

// var intervalId = setInterval(function() {
//     console.log(`its ${date_plus_time()}`)
//   }, 5000);

// to make sure content-type works as well
const testFunction2 = (req, res, next) => {
    res.json({
        message: 'Test works correctly',
        additionalMsg: 'More complicated use case'
    })
}

// change a test file 
const changeTestFile = (req, res, next) => {
    //logRaw(`\nchangeTestFile() called\n`)

    //console.log(file)
    file.cas = date_plus_time()

    fs.writeFileSync(folderWrite + fileName, JSON.stringify(file, null, 4), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + folderWrite + fileName);
      });
    
    res.sendStatus(200)
 
    //logRaw(`\nchangeTestFile() exiting\n`)
}


// FROM CODE ONLY
const onPremiseChangeTestFile = (req, res, next) => {
    //logRaw(`\nchangeTestFile() called\n`)

    //console.log(file)
    file.cas = date_plus_time()

    fs.writeFileSync(folderWrite + fileName, JSON.stringify(file, null, 4), function (err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + folderWrite + fileName);
      });
 
    //logRaw(`\nchangeTestFile() exiting\n`)
}

module.exports = {
    showTimeTest, testFunction, testFunction2,
    changeTestFile, 
    onPremiseChangeTestFile
}
