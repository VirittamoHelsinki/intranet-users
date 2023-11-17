import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { getAllPublic } from "~/api/services";
import { CookieTracker } from "~/utils/CookieTracker";
import { useServiceStore } from "~/utils/store";
import Login from "~/pages/Login";
import Register from "~/pages/Register";
import Reset from "~/pages/Reset";
import Services from "~/pages/Services";
import ServiceForm from "~/pages/ServiceForm";
import Users from "~/pages/Users";
import { ThemeProvider } from "~/@/components/theme-provider";
import { Navbar } from "~/@/components/header";

export default function App() {
  const setPublicServices = useServiceStore((state) => state.setPublicServices);

  // Load the allowed domains from the server and save them to the state.
  const loadPublicServices = async () => {
    try {
      const services = await getAllPublic();
      setPublicServices(services);
    } catch (exception) {
      console.log("exception: ", exception);
    }
  };

  useEffect(() => {
    loadPublicServices();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CookieTracker />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path={"/" || "/:domain" || "/login" || "/login/:domain"} element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/register/:domain" element={<Register />} />

          <Route path="/resetpassword" element={<Reset />} />

          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceForm />} />
          <Route path="/services/add" element={<ServiceForm />} />

          <Route path="/users" element={<Users />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
