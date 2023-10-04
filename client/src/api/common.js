import axios from "axios";
import axiosRetry from "axios-retry";
import { config } from "./authorize";
import { apiUrl } from "../config";
const url = apiUrl;

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const getAll = async (service) => {
  const completeUrl = url + service;

  const response = await axios.get(completeUrl, config());

  console.log("got response!");
  return response.data;
};

const get = async (id, service) => {
  const response = await axios.get(url + service + `/${id}`, config());

  return response.data;
};

const post = async (object, service) => {
  const response = await axios.post(url + service, object, config());

  return response.data;
};

const put = async (id, object, service) => {
  const response = await axios.put(url + service + `/${id}`, object, config());

  return response.data;
};

const del = async (id, service) => {
  const response = await axios.delete(url + service + `/${id}`, config());

  return response.data;
};

export default { getAll, get, post, put, del };
