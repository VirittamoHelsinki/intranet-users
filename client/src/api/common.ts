import axios from "axios";
import axiosRetry from "axios-retry";
import { config } from "./authorize";
import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

export async function getAll(service) {
  const completeUrl = apiUrl + service;

  const response = await axios.get(completeUrl, config());

  console.log("got response!");
  return response.data;
};

export async function get(id, service) {
  const response = await axios.get(apiUrl + service + `/${id}`, config());

  return response.data;
};

export async function post(object, service){
  const response = await axios.post(apiUrl + service, object, config());

  return response.data;
};

export async function put(id, object, service) {
  const response = await axios.put(apiUrl + service + `/${id}`, object, config());

  return response.data;
};

export async function del(id, service) {
  const response = await axios.delete(apiUrl + service + `/${id}`, config());

  return response.data;
};

