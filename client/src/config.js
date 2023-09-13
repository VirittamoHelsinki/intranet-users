const environment = process.env.NODE_ENV

// Development mode configuration (default)
let apiUrl = process.env.REACT_APP_API_URL_DEV
let portalUrl = process.env.REACT_APP_PORTAL_URL_DEV
let protocol = "http"

if (environment === 'production'){
    apiUrl = process.env.REACT_APP_API_URL
    portalUrl = process.env.REACT_APP_PORTAL_URL
    //protocol = "https"
}

export { apiUrl, protocol, environment, portalUrl }