import axios from 'axios'
import axiosRetry from 'axios-retry'

import commonService from './common'
import { config } from './authorize'
import { apiUrl } from '../config'

axiosRetry(axios, {
    retries: 5,
    retryDelay: axiosRetry.exponentialDelay
})

const service = '/services'
const url = apiUrl + service

const getAll = async ()           => commonService.getAll(service)
const create = async object       => commonService.post(object, service)
const update = async (id, object) => commonService.put(id, object, service)
const remove = async id           => commonService.del(id, service)

export default { getAll, create, update, remove }