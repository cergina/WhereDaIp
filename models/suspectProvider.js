const mongoose = require('mongoose')
const slugify = require('slugify')

const suspectProviderSchema = new mongoose.Schema({
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
    // if URL is empty its manual added list
    baseUrl: {
        type: String,
        required: false
    },
    restMethod: {
        type: Number,
        required: true,
        default: 0,
        _options: ["GET= url", "NONE"]
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
    tagList: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TagSchema'
    }],
    ipList: [
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
suspectProviderSchema.pre('validate', function(next) {
    if (this.name) {
        this.slug = slugify(this.name, {lower: true, strict: true })
    }

    next()
})

module.exports = mongoose.model('SuspectProviderSchema', suspectProviderSchema)
