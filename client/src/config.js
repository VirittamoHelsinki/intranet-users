const environment = process.env.NODE_ENV

// Development mode configuration (default)
let apiUrl = process.env.REACT_APP_API_URL_DEV
let portalUrl = process.env.REACT_APP_PORTAL_URL_DEV

if (environment === 'production'){
    apiUrl = process.env.REACT_APP_API_URL_PROD
    portalUrl = process.env.REACT_APP_PORTAL_URL_PROD
}

export { apiUrl, environment, portalUrl }