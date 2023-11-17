import { useEffect } from "react";
import Cookies from "universal-cookie";

import {setToken} from "../api/authorize";
import {getUser} from "../api/users";
import { useUserStore } from "./store";

export function CookieTracker() {
  const setUser = useUserStore((state) => state.setUser);

  const loadCookies = async () => {
    const cookies = new Cookies();
    const usersToken = cookies.get("usersToken");

    if (usersToken) {
      // Initialize the user state with the token from the cookie.
      setToken(usersToken);

      try {
        // Load user information from the server.
        setUser(await getUser());
      } catch (error) {
        // If the token is invalid, remove the token cookie.
        cookies.remove("usersToken");
      }
    }
  };
  useEffect(() => {
    loadCookies();
  }, []);

  return null;
}
