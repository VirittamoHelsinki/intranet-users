import React, { useState } from "react";

import { reset } from "../api/reset";
import { useUserStore } from "../utils/store";
import { Label } from "~/@/components/ui/label";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { Link } from "react-router-dom";

export default function Reset() {
  const [email, setEmail] = useState("");

  const user = useUserStore((state) => state.user);

  if (user)
    return (
      <main className="flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <h2 className="text-3xl">
          This page is only available when you are not logged in.
        </h2>
        <Link to="/" className="opacity-70 hover:opacity-100 hover:underline">
          Mene takasin etusivulle
        </Link>
      </main>
    );

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("Resetting password for: " + email);
    const message = await reset({ email });

    if (message.success) {
      alert(
        "Password change link has been sent to your email address. It will expire in 10 minutes."
      );
    } else if (message.error) {
      alert(`Reset failed, ${message.error}`);
    }
  }

  return (
    <main className="flex flex-col min-h-0 grow justify-center items-center gap-3 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col w-full max-w-xs gap-4">
        <h2 className="text-xl">Vaihda salasanaa</h2>
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Sähköposti</Label>
            <Input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="textInput"
            />
          </div>
          <Button type="submit">Vaihda salasana</Button>
        </form>
      </div>
    </main>
  );
}
