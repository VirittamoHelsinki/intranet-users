require('dotenv').config()

const port = process.env.PORT
const apiUrl = process.env.API_URL

// Email used for sending password reset links.
const email = process.env.SERVICE_EMAIL
const emailPW = process.env.SERVICE_EMAIL_PASSWORD

// URL of this service.
const url = process.env.DOMAIN

const environmentMode = process.env.NODE_ENV

// Development mode is default.
let mongoUrl = process.env.MONGODB_URI

if      (environmentMode === 'test')       mongoUrl = process.env.TEST_MONGODB_URI
else if (environmentMode === 'production') mongoUrl = process.env.PRODUCTION_MONGODB_URI

// Domains that are allowed to use this service.
const allowedDomains = process.env.ALLOWED_DOMAINS.split(',')

// domain keys are used to authorize requests with each domain.
// the app using the domain needs to know the key for its domain
// so that requests can be authorized.
const domainKeys = {}

// Map the allowed domains to their keys.
process.env.DOMAIN_KEYS.split(',').forEach((key, index) => {
  domainKeys[allowedDomains[index]] = key
})

const protocol = environmentMode === 'production' ? 'https' : 'http'

const secret = process.env.SECRET

module.exports = {
  apiUrl,
  mongoUrl,
  port,
  email,
  emailPW,
  url,
  environmentMode,
  allowedDomains,
  domainKeys,
  protocol,
  secret
}
