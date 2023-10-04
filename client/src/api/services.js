import axios from "axios";
import axiosRetry from "axios-retry";

import commonService from "./common";
import { config } from "./authorize";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const service = "/services";
const url = apiUrl + service;

// Get all public information about the services.
const getAllPublic = async () => {
  const response = await axios.get(`${url}/public`);

  return response.data;
};

const getAll = async () => commonService.getAll(service);
const create = async (object) => commonService.post(object, service);
const update = async (id, object) => commonService.put(id, object, service);
const remove = async (id) => commonService.del(id, service);

export default { getAllPublic, getAll, create, update, remove };
