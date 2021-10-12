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
    // response
    // successPath: {
    //     type: String,
    //     required: false
    // },
    // typePath: {
    //     type: String,
    //     required: false
    // },
    // continentPath: {
    //     type: String,
    //     required: false
    // },
    // countryPath: {
    //     type: String,
    //     required: false
    // },
    // countryCodePath: {
    //     type: String,
    //     required: false
    // },
    // countryFlagPath: {
    //     type: String,
    //     required: false
    // },
    // regionPath: {
    //     type: String,
    //     required: false
    // },
    // cityPath: {
    //     type: String,
    //     required: false
    // },
    // latitudePath: {
    //     type: String,
    //     required: false
    // },
    // longitudePath: {
    //     type: String,
    //     required: false
    // },
    // orgPath: {
    //     type: String,
    //     required: false
    // },
    // ispPath: {
    //     type: String,
    //     required: false
    // },
    // currencyPath: {
    //     type: String,
    //     required: false
    // },
    // fulfilledRequestsPath: {
    //     type: String,
    //     required: false
    // },
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
        fulfilledRequestsPath: String
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
