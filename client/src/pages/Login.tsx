import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useUserStore, useServiceStore } from "~/utils/store";
import { authenticate, authenticateForService } from "~/api/authenticate";
import { authorizeForService, setToken } from "~/api/authorize";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(11),
});

export default function Login() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const publicServices = useServiceStore((state) => state.publicServices);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // url/?domain=example.com
  const domain = searchParams.get("domain");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  })

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

  if (domain && !publicServices?.find((s) => s.domain === domain)) {
    return (
      <main className="px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <p>
          URL kentän domain parametrin arvo ei sisällä mitään sallituista
          sivuista.
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <p>Olet kirjautunut sisään email: {user.email}</p>
      </main>
    );
  }

  async function onLogin(value: z.infer<typeof loginSchema>) {

    let authenticatedUser = null;

    try {
      if (domain) {
        // If an external service was specified with the domain parameter.
        authenticatedUser = await authenticateForService(
          { email: value.email, password: value.password },
          domain,
        );
      } else {
        authenticatedUser = await authenticate({ email: value.email, password: value.password });
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

  return (
    <main className="flex flex-col grow justify-center items-center gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col w-full max-w-xs gap-2">
        <h2 className="text-xl">Kirjaudu Sisään Intranettiin</h2>
        <p className="text-xs opacity-70">
          Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onLogin)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sähköposti</FormLabel>
                  <FormControl>
                    <Input placeholder="arto.aitta@hel.fi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salasana</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="superS4lanenSalasana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Kirjaudu sisään</Button>
          </form>
        </Form>
        <div className="flex flex-col pt-3">
          <Link to="/resetpassword" className="loginLink">
            Unohditko salasanan?
          </Link>
        </div>
      </div>
    </main>
  );
}
