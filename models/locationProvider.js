const mongoose = require('mongoose')
const slugify = require('slugify')

const locationProviderSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true
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
        type: String,
        required: true,
        default: "json"
    },
    baseUrl: {
        type: String,
        required: true
    },
    restMethod: {
        type: String,
        required: true
    },
    isFree: {   
        type: Boolean,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
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
    request: {
        ipAddress: {
            type: String,
            required: true
        },
        authentication: {
            type: String,
            required: false
        }
    },
    response: {
        successPath: String,
        typePath: String,
        continentPath: String,
        countryPath: String,
        countryCodePath: String,
        countryFlagPath: String,
        regionPath: String,
        cityPath: String,
        latitudePath: String,
        longitudePath: String,
        orgPath: String,
        ispPath: String,
        currencyPath: String,
        fullfilledRequestsPath: Number
    }
})

// anytime save, update, create and delete
locationProviderSchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, {lower: true, strict: true })
    }

    next()
})

module.exports = mongoose.model('LocationProviderSchema', locationProviderSchema)
