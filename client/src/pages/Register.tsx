import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "universal-cookie";

import { createUser } from "~/api/users";
import { setToken } from "~/api/authorize";
import { authenticate } from "~/api/authenticate";
import { useServiceStore, useUserStore } from "~/utils/store";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/@/components/ui/form";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(11),
  confirm: z.string().min(11),
});

export default function Register() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const publicServices = useServiceStore((state) => state.publicServices);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // /register/?domain=test
  const domain = searchParams.get("domain");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

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
        <p>Olet kirjautunut sisään sähköpostilla: {user.email}</p>
      </main>
    );
  }


  async function onRegister(value: z.infer<typeof registerSchema>) {
    try {
      await createUser({ email: value.email, password: value.password });

      const authenticatedUser = await authenticate({ email: value.email, password: value.password });

      if (authenticatedUser) {
        setToken(authenticatedUser.token);
        const cookies = new Cookies();

        cookies.set("usersToken", authenticatedUser.token, {
          // Cookie expires in 60 days.
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
          path: "/",
        });

        setUser(authenticatedUser);

        navigate("/");
      } else alert("Failed to login");
    } catch (exception) {
      alert("Registration failed on the server.");
    }
  };

  return (
    <main className="flex flex-col min-h-0 flex-1 gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col grow justify-center items-center">
        <div className="flex flex-col w-full max-w-xs gap-2">
          <h2 className="text-xl">Luo uusi käyttäjä Intranettiin</h2>
          <p className="text-xs opacity-70">
            Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onRegister)} className="flex flex-col gap-3">
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
                      <Input type="password" placeholder="supers4lanensana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salasana uudelleen</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="supers4lanensana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Rekisteröidy</Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
