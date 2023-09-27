// 1. This router functions as an authorization endpoint. Where other services
// can check whether or not users have authorization to use the service.
// and if their access level is high enough.
// 2. Also has paths that authorize a user to get a valid token for another
// service.

// Node imports
const axios = require('axios')

// Create router.
const authorizeRouter = require('express').Router();

// Local imports.
const User = require('../models/user')
const Service = require('../models/service')
const {
  requireAuthorization, addTokenToBlacklist, getTokenFrom
} = require('../middleware/authorize')


// From here on require valid authorization(token) on all routes.
authorizeRouter.all('*', requireAuthorization)

// Returns user information, for a client with a valid token.
// A Simple way to check that the user has a valid token.
authorizeRouter.get('/', async (req, res, next) => {
    try {
      const { user } = res.locals
      
      res.json(User.format(user))
  
    } catch (exception) { next(exception) }
})


// Route that authorizes the user to use a specific service,
// that does authorization by itself. Called when the user
// redirected to the login page from another service
// already has a valid token on the users service.
// Returns a key that a client can use to get a token from
// the service defined in the domain parameter.
authorizeRouter.get('/app/:domain', async (req, res, next) => {
  try {
    const { user } = res.locals
    const domain = req.params.domain.toLowerCase()
    const token = getTokenFrom(req)

    const service = await Service.findOne({ domain })
    
    if (!service) {
      return res.status(401).json({ error: 'unauthorized domain' })
    }

    // Confirm to the service that the user has been authenticated.
    const response = await axios.post(
      `${service.protocol}://${domain}/api/authorize`,

      // Send the authentication password, so that
      // the service knows its the user service that is sending the request.
      {
        email: user.email,
        token,
        service_key: service.serviceKey
      }
    )

    // Get a one time use user_key that allows the redirected user to get,
    // their token from the service.
    const { user_key } = response.data

    // token is used by the user service and the user_key is used by the
    // service on the domain.
    res.status(200).send({ user_key, ...User.format(user) })

    // Authorization is for the outside domain, token is for the user service.

    // After receiving this response on the frontend, redirect the
    // user to the domain's homepage, with the Authorization header

  } catch (exception) {next(exception)}
})


// Cheks whether the user has a high enough authorization level requested by
// the service.
authorizeRouter.get('/service/:name/:level', async (req, res, next) => {
  try {
    const { user } = res.locals
    let { name, level } = req.params

    if (!user) return res.status(401).json({ error: 'No valid user token.' })

    const service = await Service.findOne({ name })

    if (!service) {
      return res.status(401).json({ error: 'The service does not exist.'})
    }

    // Find and access entry for the service from the list if it exists.
    const access = user.access.find(a => a.service.equals(service._id))
    
    if (!access) {
      return res.status(401).json({
        error: 'The user has no access level on this service.'
      })
    }

    if (access.level < level) {
      return res.status(401).json({
        error: 'The user does not have a high enough access level on this service.'
      })
    }

    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// User can blacklist their token by logging out so that it
// will no longer function for user authorization.
authorizeRouter.get('/logout', async (req, res, next) => {
  try {

    // Add the token to the blacklist.
    addTokenToBlacklist(req, res, next)

    res.status(200).end()

  } catch (exception) { next(exception) }
})


module.exports = authorizeRouter