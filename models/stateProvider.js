const mongoose = require('mongoose')

const stateProviderSchema = new mongoose.Schema({
    isBusy: {
        type: Number,
        required: true,
        default: 0,
        _options: ["No", "Yes"]
    },
    type: {
        type: Number,
        required: true,
        default: 0,
        _options: ["GeneralState", "Test", "Geolocation", "Analysis"]
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expectedEndAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

// anytime save, update, create and delete
stateProviderSchema.pre('validate', function(next) {
    
    next()
})

module.exports = mongoose.model('StateProviderSchema', stateProviderSchema)
