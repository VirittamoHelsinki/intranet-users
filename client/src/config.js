import dotenv from 'dotenv'
const environment = process.env.REACT_APP_ENV

console.log("here are all the frontside environment: ", dotenv.config(), process.env.REACT_APP_API_URL_DEV)

// Development mode configuration (default)
let apiUrl = process.env.REACT_APP_API_URL_DEV
let portalUrl = process.env.REACT_APP_PORTAL_URL_DEV

if (environment === 'production'){
    apiUrl = process.env.REACT_APP_API_URL_PROD
    portalUrl = process.env.REACT_APP_PORTAL_URL_PROD
}

export { apiUrl, environment, portalUrl }