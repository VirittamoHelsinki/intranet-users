// This router handles adding and removing service entries to the system.
// Authentication and authorization is only allowed for systems in the
// the database.

const serviceRouter = require('express').Router()

// Local imports.
const User = require('../models/user')
const Service = require('../models/service')

const { protocol } = require('../config.js')
const { requireAuthorization } = require('../middleware/authorize')

// Middleware that checks if the user making the request is an admin.
const userIsAdmin = (req, res, next) => {
    if (!res.locals.user.admin) {
        return res.status(401).json({ error: 'unauthorized user' })
    }
    next()
}

// Get the allowed service domains.
serviceRouter.get('/domains', async (req, res, next) => {
    try {
        const domains = await Service.find({})
        
        res.json(domains.map(service => service.domain))
    
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
        const { name, domain, domainKey } = req.body

        if (!name)      return res.status(400).json({ error: 'name is missing' })
        if (!domain)    return res.status(400).json({ error: 'domain is missing' })
        if (!domainKey) return res.status(400).json({ error: 'domainKey is missing' })

        const service = new Service({
            name,
            domain,
            domainKey
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
        const { name, domain, domainKey } = req.body

        if (!name && !domain && !domainKey) {
            return res.status(400).json({ error: 'no fields provided for editing.' })
        }

        // update the service.
        const updatedService = await Service.findByIdAndUpdate(id, {
            name,
            domain,
            domainKey
        }, { new: true })

        if (!updatedService) {
            return res.status(400).json({ error: 'service does not exist' })
        }

        res.json(updatedService)
    
    } catch (exception) { next(exception) }
})

module.exports = serviceRouter