import axios from "axios";
import axiosRetry from "axios-retry";
import {post, put, del} from "./common";
import { config } from "./authorize";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const service = "/users";
const url = apiUrl + service;

export async function createUser(object){
  return post(object, service);
}

export async function updateUser(id, object){
  return put(id, object, service);
}
export async function removeUser(id) {
  return del(id, service);
}

export async function getUser(){
  const response = await axios.get(url, config());

  return response.data;
};

export async function getAllUsers() {
  const response = await axios.get(`${url}/all`, config());

  return response.data;
};
