mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    domain: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    domainKeyHash: {
        type: String,
        required: true
    }
})

// Return service information without the domainKeyHash.
serviceSchema.statics.format = ({
    _id, name, domain
}) => ({
    _id,
    name,
    domain
})

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service