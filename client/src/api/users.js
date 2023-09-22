import axios from 'axios'
import axiosRetry from 'axios-retry'
import commonService from './common'
import { config } from './authorize'

import { apiUrl } from '../config'

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay
})

const service = '/users'
const url = apiUrl + service

const create = async object => commonService.post(object, service)

const get = async () => {
  const response = await axios.get(url, config())

  return response.data
}

export default { create, get }
