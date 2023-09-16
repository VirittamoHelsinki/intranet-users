const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { secret } = require('../config')


// Parse the token out of the authorization header.
const getTokenFrom = req => {
  const authorization = req.get('authorization')

  // String 'bearer ' is removed from the authorization header,
  // if it exists.
  if (authorization &&
      authorization.toLowerCase().startsWith('bearer ')
  
  ) return authorization.substring(7)

  return null
}


// Middleware that checks if the request has a valid token, in the authroziation header.
const requireAuthorization = async (req, res, next) => {
  try {
      // Parse the token from the authorization header
      const token = getTokenFrom(req)

      if (!token) {
          return res.status(401).json({ error: 'token missing or too short' })
      }

      let decodedToken = {}

      decodedToken = jwt.verify(token, secret)

      if (!decodedToken.id) {
          return res.status(401).json({ error: 'invalid token' })
      }

      const user = await User.findById(decodedToken.id)

      if (!user) return res.status(401).json({ error: 'invalid token' })

      res.locals.user = user

      next()

  } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        console.log(error)
        console.log('error.message:', error.message)
          return res.status(401).json({ error: error.message })
      
      } else return next(error)
  }
}


module.exports = {
  requireAuthorization
}
