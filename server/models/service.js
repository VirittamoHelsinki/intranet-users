mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    domain: {
        // Url of the service.
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    serviceKey: {
        // The users app identifies itself to the service by sending this key.
        // The service must have this key saved into its environment variables.
        // Each service has its own key so that if one services key is compromised,
        // the other services are still safe from someone using the compromised key
        // for pretending to be the users service.
        // !! This key must never be sent to any client. Use only between servers. !!
        type: String,
        required: true
    }
})

// Return service information without the serviceKey.
serviceSchema.statics.format = ({
    _id, name, domain
}) => ({
    _id,
    name,
    domain
})

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service