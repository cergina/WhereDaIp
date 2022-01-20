const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    }
})

// anytime save, update, create and delete
tagSchema.pre('validate', function(next) {
    console.log(`tag validation: ${this.name} ${this.count}`)

    next()
})

module.exports = mongoose.model('TagSchema', tagSchema)
