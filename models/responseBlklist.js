const mongoose = require('mongoose')
const slugify = require('slugify')
const { stringIsAValidUrl } = require('../services/helper')

const responseBlklistSchema = new mongoose.Schema({
    addedAt: {
        type: Date,
        required: true, 
        default: Date.now
    }, 
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BlklistProviderSchema'
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    analyzed: {
        type: Number,
        required: true,
        default: 0
    },
    // parts from response
    list: [
        {
            checked: String, // true, false

            externalId: String,
            externalDate: String,
            url: String,
            urlStatus: String,
            lastOnline: String,
            tags: String,
            externalUrl: String
        }
    ]
})

responseBlklistSchema.pre('validate', function(next) {
    

    next()
})

module.exports = mongoose.model('ResponseBlklistSchema', responseBlklistSchema)
