import axios from "axios";
import axiosRetry from "axios-retry";
import { apiUrl } from "../config";

type Credential = {
  email: string,
  password: string
};

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

const url = `${apiUrl}/authenticate`;

export async function authenticate(credentials: Credential) {
  const response = await axios.post(url, credentials);

  return response.data;
};

export async function authenticateForService(credentials: Credential, domain: string) {
  const response = await axios.post(`${url}/${domain}`, credentials);

  return response.data;
};

