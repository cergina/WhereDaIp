const mongoose = require('mongoose')
const slugify = require('slugify')
const { stringIsAValidUrl } = require('../services/helper')

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
    limit: {
        type: Number,
        required: true,
        default: 1
    },
    restMethod: {
        type: Number,
        required: true,
        default: 0,
        _options: ["GET= url + ?param=ip", "GET= url + /ip", "POST + body app/json", "GET= url + /ip + ?fields="]
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
        fulfilledRequestsPath: String,
        asPath: String,
        mobilePath: String,
        proxyPath: String,
        hostingPath: String
    }
})

// anytime save, update, create and delete
locationProviderSchema.pre('validate', function(next) {
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

    if (this.limit < 1 || this.limit % 1 !== 0) {
        const validationError = this.invalidate(
            'limit',
            'Max IPs has to be positive number'
        )

        throw validationError
    }

    next()
})

module.exports = mongoose.model('LocationProviderSchema', locationProviderSchema)
