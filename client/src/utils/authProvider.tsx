import React, { createContext, useContext, useEffect } from 'react';
import Cookies from "universal-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useServiceStore, useUserStore } from "./store";
import { authenticate, authenticateForService } from "../api/authenticate";
import { authorizeForService, setToken } from "../api/authorize";

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const publicServices = useServiceStore((state) => state.publicServices);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // /register/?domain=test
  const domain = searchParams.get("domain");

  async function authorizeAndRedirectUserToService() {
    const data = await authorizeForService(domain);
    const service = publicServices?.find((s) => s.domain === domain);
    console.log(publicServices);

    if (!service) return console.log("service not found for domain: ", domain);

    const protocol = service.protocol;

    window.location.href = `${protocol}://${domain}/?user_key=${data.user_key}`;
  };

  useEffect(() => {
    if (user && domain && publicServices?.find((s) => s.domain === domain)) {
      // If the user is already logged in and the domain parameter is specified,
      // redirect the user to the external service with the service key.
      authorizeAndRedirectUserToService();
    }
  }, [publicServices?.length, user]);


  async function login(userData: { email: string; password: string }) {
    let authenticatedUser = null;

    try {
      if (domain) {
        // If an external service was specified with the domain parameter.
        authenticatedUser = await authenticateForService(
          { email: userData.email, password: userData.password },
          domain,
        );
      } else {
        authenticatedUser = await authenticate({ email: userData.email, password: userData.password });
      }
    } catch (exception) {
      console.log("exception: ", exception);
    }

    if (authenticatedUser) {
      setToken(authenticatedUser.token);

      const cookies = new Cookies();

      cookies.set("usersToken", authenticatedUser.token, {
        // Cookie expires in 60 days.
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        path: "/",
      });

      setUser(authenticatedUser);

      if (domain) {
        // If an external service was specified with the domain parameter.
        const service = publicServices?.find((s) => s.domain === domain);

        if (!service)
          return console.log("service not found for domain: ", domain);

        const protocol = service.protocol;

        window.location.href = `${protocol}://${domain}/?user_key=${authenticatedUser.user_key}`;
      } else navigate("/");
    } else alert("Failed to login. Wrong email or password?");

  };

  async function logout() {
    await logout();
    const cookies = new Cookies();
    cookies.remove("usersToken");
    setUser(null);
  };

  return { user, setUser, login, logout };
}


const AuthContext = createContext(null)

export const useAuthContext = () => useContext(AuthContext)

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, login, logout } = useAuth();

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
