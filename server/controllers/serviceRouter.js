// This router handles adding and removing service entries to the system.
// Authentication and authorization is only allowed for systems in the
// the database.

const serviceRouter = require('express').Router()

// Local imports.
const User = require('../models/user')
const Service = require('../models/service')

const { protocol } = require('../config.js')
const { requireAuthorization, userIsAdmin } = require('../middleware/authorize')


// Get all public information about the services.
serviceRouter.get('/public', async (req, res, next) => {
    try {
        const domains = await Service.find({})
        
        res.json(domains.map(Service.format))
    
    } catch (exception) { next(exception) }
})

// From here on require valid authorization(token) on all routes.
serviceRouter.all('*', requireAuthorization)

// From here on require that the user is an admin on all routes.
serviceRouter.all('*', userIsAdmin)


// Get all information about each service.
serviceRouter.get('/', async (req, res, next) => {
    try {
        const services = await Service.find({})
        
        res.json(services)
    
    } catch (exception) { next(exception) }
})


// An admin user can add a new domain to the system.
serviceRouter.post('/', async (req, res, next) => {
    try {
        let { name, domain, protocol, serviceKey } = req.body

        if (!name)      return res.status(400).json({ error: 'name is missing' })
        if (!domain)    return res.status(400).json({ error: 'domain is missing' })
        if (!protocol)  return res.status(400).json({ error: 'protocol is missing' })
        if (!serviceKey) return res.status(400).json({ error: 'serviceKey is missing' })

        name = name.toLowerCase()
        domain = domain.toLowerCase()
        protocol = protocol.toLowerCase()

        const service = new Service({
            name,
            domain,
            protocol,
            serviceKey
        })

        const savedService = await service.save()

        res.json(Service.format(savedService))

    } catch (exception) { next(exception) }
})

// An admin user can delete a service.
serviceRouter.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        const deletedService = await Service.findByIdAndRemove(id)

        if (!deletedService) {
            return res.status(400).json({ error: 'service does not exist' })
        }

        res.json(Service.format(deletedService))

    } catch (exception) { next(exception) }
})


// An admin user can update a service.
serviceRouter.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        let { name, domain, protocol, serviceKey } = req.body

        if (!name && !domain && !protocol && !serviceKey) {
            return res.status(400).json({ error: 'no fields provided for editing.' })
        }

        if (name)     name     = name.toLowerCase()
        if (domain)   domain   = domain.toLowerCase()
        if (protocol) protocol = protocol.toLowerCase()

        // update the service.
        const updatedService = await Service.findByIdAndUpdate(id, {
            name,
            domain,
            protocol,
            serviceKey
        }, { new: true })

        if (!updatedService) {
            return res.status(400).json({ error: 'service does not exist' })
        }

        res.json(updatedService)
    
    } catch (exception) { next(exception) }
})

module.exports = serviceRouter