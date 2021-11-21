const mongoose = require('mongoose')

const responseDataSchema = new mongoose.Schema({
    ipRequested: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'LocationProviderSchema'
    },
    // parts from response
    success: {
        type: Number,
        required: true,
        default: 0,
        _options: ["no", "yes"]
    },
    type: {
        type: Number,
        required: true,
        default: 0,
        _options: ["IPv4", "IPv6"]
    },
    continent: {
        type: String, 
        required: false
    },
    country: {
        type: String, 
        required: true
    },
    countryCode: {
        type: String, 
        required: false
    },
    countryFlag: {
        type: String, 
        required: false,
        _options: ["URL to website"]
    },
    region: {
        type: String, 
        required: false
    },
    city: {
        type: String, 
        required: true
    },
    latitude: {
        type: String, 
        required: true
    },
    longitude: {
        type: String, 
        required: true
    },
    org: {
        type: String, 
        required: false
    },
    isp: {
        type: String, 
        required: true
    },
    currency: {
        type: String, 
        required: false
    },
    as: {
        type: String,
        required: false
    },
    mobile: {
        type: String,
        required: false
    },
    proxy: {
        type: String,
        required: false
    },
    hosting: {
        type: String,
        required: false
    }
})

responseDataSchema.pre('validate', function(next) {
    

    next()
})

module.exports = mongoose.model('ResponseDataSchema', responseDataSchema)
