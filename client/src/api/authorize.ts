import axios from "axios";
import axiosRetry from "axios-retry";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const url = `${apiUrl}/authorize`;

let token: string | null = null;

// Makes sure that the token is sent if it has been defined.
// Also sends the object as data if it has been defined as a
// parameter.
export function config(object) {
  if (!token && !object) return {};

  if (token && !object) return { headers: { Authorization: token } };

  if (!token && object) return { data: object };

  return {
    headers: { Authorization: token },
    data: object,
  };
};

export function setToken(newToken: string | null): void {
  if (newToken) token = `bearer ${newToken}`;
  else token = null;
};

// Authorize the user to use the service on the domain. Use this
// function when the user is already logged in to the user-service
// and therefore they dont need to authenticate themselves again.
export async function authorizeForService(domain: string | null) {
  const response = await axios.get(`${url}/app/${domain}`, config());

  return response.data;
};

// Logout the user from the user-service.
export async function logout() {
  const response = await axios.get(`${url}/logout`, config());

  setToken(null);

  return response.data;
};

