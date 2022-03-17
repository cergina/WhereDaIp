const mongoose = require('mongoose')
const slugify = require('slugify')
const { stringIsAValidUrl } = require('../services/helper')

const blklistProviderSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    name: { 
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    }, 
    format: {
        type: Number,
        required: true,
        default: 0,
        _options: ["JSON", "XML"]
    },
    baseUrl: {
        type: String,
        required: true
    },
    restMethod: {
        type: Number,
        required: true,
        default: 0,
        _options: ["GET= url"]
    },
    isActive: {
        type: Number,
        required: true,
        default: 1,
        _options: ["No", "Yes"]
    },
    addedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastEditAt: {
        type: Date,
        required: true, 
        default: Date.now
    },
    response: {
        externalId: String,
        externalDate: String,
        url:String,
        urlStatus:String,
        lastOnline:String,
        tags:String,
        externalUrl:String
    }
})

// anytime save, update, create and delete
blklistProviderSchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, {lower: true, strict: true })
    }

    if (!stringIsAValidUrl(this.baseUrl)) {
        const validationError = this.invalidate(
            'baseUrl',
            'Url is not valid'
        )

        throw validationError
    }

    next()
})

module.exports = mongoose.model('BlklistProviderSchema', blklistProviderSchema)
