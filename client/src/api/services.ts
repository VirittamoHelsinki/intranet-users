import axios from "axios";
import axiosRetry from "axios-retry";

import { getAll, put, post, del } from "./common";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const service = "/services";
const url = apiUrl + service;

// Get all public information about the services.
export async function getAllPublic() {
  const response = await axios.get(`${url}/public`);

  return response.data;
};

export async function getAllServices() {
  return getAll(service);
}
export async function createService(object) {
  return post(object, service);
}
export async function updateService(id, object) {
  return put(id, object, service);
}
export async function removeService(id) {
  return del(id, service);
}

