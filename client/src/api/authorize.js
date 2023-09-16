import axios from 'axios'
import axiosRetry from 'axios-retry'
import { config } from './users'

import { apiUrl } from '../config'

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay
})

const url = `${apiUrl}/authorize`

// Authorize the user to use the service on the domain. Use this
// function when the user is already logged in to the user-service
// and therefore they dont need to authenticate themselves again.
const authorizeForService = async domain => {
  const response = await axios.get(`${url}/${domain}`, config())

  return response.data
}

// Logout the user from the user-service.
const logout = async () => {
  const response = await axios.get(`${url}/logout`, config())

  return response.data
}

export default { authorizeForService, logout }
