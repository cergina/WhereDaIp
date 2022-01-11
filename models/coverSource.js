const mongoose = require('mongoose')
const slugify = require('slugify')

const coverSourceSchema = new mongoose.Schema({
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
        _options: ["PLAIN-TEXT"]
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
    // response list
    type: {
        type: Number,
        required: true,
        default: 0,
        _options: ["VPN servers", "TOR exit nodes"]
    },
    list: [
        {
            ip: String,
            type: {
                type: Number,
                required: true,
                default: 0,
                _options: ["IPv4", "IPv6"]
            },
        }
    ]
})

// anytime save, update, create and delete
coverSourceSchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, {lower: true, strict: true })
    }

    next()
})

module.exports = mongoose.model('CoverSourceSchema', coverSourceSchema)
