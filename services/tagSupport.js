const configuration = require("../config/config-nonRestricted")
const { logDebug, logError, logInfo, logRaw, yyyymmdd } = require('./helper.js')
const tagDb = require("../models/tagDb")

const getAllTags = async (params, res) => {
    var tags = await tagDb.find({}).sort({count: 'desc'})
    return tags
}

const findTagById = async (xid) => {
    try {
        var tagFound = await tagDb.findById(xid)

        console.log(`\nvypis setkych`)
        console.log(await tagDb.findOne({}))
        console.log(`\nende vypis setkych\n`)

        console.log(`In db: ${tagFound}`)
        console.log(`In db name: ${tagFound.name}`)

        return tagFound.name
    } catch (e) {

    }
}

const findIdByTag = async (xtag) => {
    try {
        var tagFound = await tagDb.findOne({name: xtag})

        //console.log(`In db: ${tagFound}`)
        //console.log(`In db name: ${tagFound.name}`)

        return tagFound._id
    } catch (e) {

    }
}

function getCountOfTag(tag) {

}

const addTag = async (params, res) => {
    try {
        var tagName = getTagName(params)
        
        //console.log(`Gotten name ${tagName}`)

        // TODO if exists in db inc++ else  count = 0
        var foundTag = await tagDb.findOne({ name: tagName })
        if (foundTag) {
            foundTag.count = foundTag.count + 1
        } else {
            foundTag = new tagDb()
            foundTag.name = tagName
            foundTag.count = 1
        }
        //console.log('Attempt to save ' + foundTag.name + foundTag.count)
        return out = await foundTag.save()
    } catch (e) {
        logError(e)
        // if we want to do something we need to do throw(e) otherwise promise is marked as resolved still
    }
}

const decreaseTag = async (params, res) => {
    try {
        var tagName = getTagName(params)
        
        //console.log(`Gotten name ${tagName}`)

        // TODO if exists in db inc-- else  nth
        var foundTag = await tagDb.findOne({ name: tagName })
        if (foundTag) {
            foundTag.count = foundTag.count - 1
            
            if (foundTag.count <= 0) {
                await removeTag(params)
            }
        }

        return out = await foundTag.save()
    } catch (e) {
        logError(e)
    }
}

const removeTag = async (params, res) => {
    try {
        const foundTag = await tagDb.findOne({ name: getTagName(params) })
        
        if (foundTag != null)
            await tagDb.findByIdAndDelete(foundTag._id)
    } catch (e) {

    }
}

const removeAllTags = async (params, res) => {
    try {
        console.log(`REMOVING ALL TAGS FROM DATABASE`)
        
        await tagDb.deleteMany({})
    } catch (e) {

    }
}

function getTagName(param) {
    if (typeof param === 'string')
            return param
        else if (typeof param.tag === 'string')
            return param.tag
        else {
            logError("Tag name not present")
            return undefined
        }
}

module.exports = {
    findTagById, findIdByTag, getCountOfTag,
    addTag, removeTag, decreaseTag, 
    getAllTags, removeAllTags
}