const mongoose = require('mongoose')

const fusedDataSchema = new mongoose.Schema({
    ipRequested: {
        type: String,
        required: true
    },
    firstAddedAt: {
        type: Date,
        required: true
    },
    lastAddedAt: {
        type: Date,
        required: true   
    }
})

fusedDataSchema.pre('validate', function(next) {

    next()
})

module.exports = mongoose.model('FusedDataSchema', fusedDataSchema)
