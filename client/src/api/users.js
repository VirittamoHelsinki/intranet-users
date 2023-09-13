import axios from 'axios'
import axiosRetry from 'axios-retry'
import commonService from './common'

import { apiUrl } from '../config'

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay
})

const service = '/users'
const url = apiUrl+service
let token = null

export const config = object => {
  if (!object) return { headers: { 'Authorization': token } }

  return {
    headers: { 'Authorization': token },
    data: object
  }
}

const setToken = (newToken) => {
  token = `bearer ${newToken}`
}

const create = async object => commonService.post(object, service)

const get = async () => {
  const response = await axios.get(url, config())

  return response.data
}

export default { setToken, create, get }
