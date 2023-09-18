mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: String,
    domain: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    domainKey: {
        type: String,
        required: true
    }
})

const Service = mongoose.model('Service', serviceSchema)

module.exports = Service