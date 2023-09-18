// This router handles all requests that contain user authentication.
// (Requests that require email/username and password.)

// Npm imports.
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const axios = require('axios')
const authenticateRouter = require('express').Router()

// Local imports.
const User = require('../models/user')
const { protocol, allowedDomains, domainKeys } = require('../config.js')


// Authenticate user without forwarding them to any service.
authenticateRouter.post('/', async (req, res, next) => {
  let { email, password } = req.body

  if (!email)    return res.status(400).json({ error: 'email is missing' })
  if (!password) return res.status(400).json({ error: 'password is missing' })

  email = email.toLowerCase()

  const user = await User.findOne({ email })

  if (!user) {
    // If there does not exist a user with the given email.
    return res.status(401).json({ error: 'invalid email or password' })
  }

  // Compare the body password to the saved password hash of the user.
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    // If the password is incorrect.
    return res.status(401).json({ error: 'invalid email or password' })
  }

  // Sign a token.
  const token = user.generateJWT()

  // Return the user and the token.
  res.status(200).send({ token, ...User.format(user) })
})


// Route that does authentication for sites that do authorization
// by themselves.
// Returns a key that a client can use to get a token from
// the service defined in the domain parameter.
authenticateRouter.post('/:domain', async (req, res, next) => {
  try {
    let { email, password } = req.body
    const domain = req.params.domain.toLowerCase()

    if (!allowedDomains.includes(domain)) {
      return res.status(401).json({ error: 'unauthorized domain' })
    }

    if (!email)    return res.status(400).json({ error: 'email is missing' })
    if (!password) return res.status(400).json({ error: 'password is missing' })

    email = email.toLowerCase()

    const user = await User.findOne({ email })

    // If there does not exist an account with this email:
    if (!user) return res.status(401).json({ error: 'invalid email or password' })

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    // If the password is incorrect:
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'invalid email or password' })
    }

    // Sign a token.
    const token = user.generateJWT()

    // Confirm to the service that the user has been authenticated.
    const response = await axios.post(
      `${protocol}://${domain}/api/users/authorization`,

      // Send the authentication password, so that
      // the service knows its the user service that is sending the request.
      { email, domain_key: domainKeys[domain] }
    )

    // Get a one time use service_key that allows the redirected user to get,
    // their token from the service.
    const { service_key } = response.data

    // token is used by the user service and the service_key is used by the
    // service on the domain.
    res.status(200).send({ token, service_key, ...User.format(user) })

    // Authorization is for the outside domain, token is for the user service.

    // After receiving this response on the frontend, redirect the
    // user to the domain's homepage, with the Authorization header

  } catch (exception) {next(exception)}
})

module.exports = authenticateRouter
