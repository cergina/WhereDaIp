const mongoose = require('mongoose')
const slugify = require('slugify')

const locationProviderSchema = new mongoose.Schema({
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
        _options: ["GET= url + ?param=ip", "GET= url + /ip", "POST + body app/json"]
    },
    isFree: {   
        type: Number,
        required: true,
        default: 1,
        _options: ["No", "Yes"]
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
    request: {
        ipAddress: {
            type: String,
            required: false,
            default: ""
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
        fulfilledRequestsPath: Number
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
