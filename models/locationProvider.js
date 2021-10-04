const mongoose = require('mongoose')

const locationProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        fullfilledRequestsPath: Number,
        required: true
    }
})

module.exports = mongoose.model('LocationProviderSchema', locationProviderSchema)
