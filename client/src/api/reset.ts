import axios from "axios";
import axiosRetry from "axios-retry";

import { apiUrl } from "../config";

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
});

export async function reset(user) {
  try {
    console.log("Trying reset service for: ", user);
    const response = await axios.post(`${apiUrl}/reset`, user);

    console.log("Reset succeeded : " + response.data);

    return response.data;
  } catch (exception) {
    console.log(exception._message);

    console.log("reset service failed : " + exception);

    return { error: "Reset failed" };
  }
};
