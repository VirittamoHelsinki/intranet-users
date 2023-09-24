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
const update = async (id, object) => commonService.put(id, object, service)
const remove = async id => commonService.del(id, service)

const get = async () => {
  const response = await axios.get(url, config())

  return response.data
}

const getAll = async () => {
  const response = await axios.get(`${url}/all`, config())

  return response.data
}

export default { create, update, remove, get, getAll }
