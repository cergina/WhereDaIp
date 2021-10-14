const mongoose = require('mongoose')
const slugify = require('slugify')

// TODO pozor, mozno zaujimave
// niektore maju https://geo.ipify.org/?mc=adwords&utm_term=ip%20geolocation%20api&utm_campaign=October+-+Pilot&utm_source=adwords&utm_medium=ppc&hsa_acc=2564220217&hsa_cam=6767142137&hsa_grp=78387694054&hsa_ad=424587132136&hsa_src=g&hsa_tgt=kwd-332054273884&hsa_kw=ip%20geolocation%20api&hsa_mt=e&hsa_net=adwords&hsa_ver=3&gclid=CjwKCAjwh5qLBhALEiwAioods2sSt7iBRM1lm0_dyJKags7vRXI_1_ctmd8CRJVLB_TdNJjBxvIDuxoCtsMQAvD_BwE
// aj take ze tor, proxy, vpn vedia identifikovat

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
