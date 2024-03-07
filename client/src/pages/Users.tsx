import { useState, useEffect, useCallback } from "react";
import { getAllServices } from "~/api/services";
import { getAllUsers, removeUser, updateUser } from "~/api/users";
import { useUserStore, useServiceStore, User, Access } from "~/utils/store";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/@/components/ui/dropdown-menu";
import { Button } from "~/@/components/ui/button";
import { MoreHorizontalIcon, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";
import { Link } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const accessSchema = z.object({
  service: z.string(),
  name: z.string(),
  accessLevels: z.number(),
});

const accessLevels = [
  { role: "user", accessLevel: 1 },
  { role: "content editor", accessLevel: 2 },
  { role: "admin", accessLevel: 3 },
];

function SetAccessLevel({ user }: { user: User }) {
  const users = useUserStore((state) => state.users);
  const setUsers = useUserStore((state) => state.setUsers);
  const services = useServiceStore((state) => state.services);
  const [accessLevel, _setAccessLevel] = useState(1);
  const [service, _setService] = useState(services[0]);

  const form = useForm({
    defaultValues: {
      user: [{ accesslevel: 1, app: "tyoaikaleimaus-palvelu" }],
    },
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "user",
  });
  async function onSubmit(data: z.infer<typeof accessSchema>) {
    const access = user.access.find((a: Access) => a.service === service._id);

    if (access) access.level = data.accessLevels;
    else {
      user.access.push({
        service: service._id,
        name: service.name,
        level: accessLevel,
      });
    }

    const updatedUser = await updateUser(user._id, user);

    setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
  }

  async function uploadAccessLevel() {
    try {
      const access = user.access.find((a: Access) => a.service === service._id);

      if (access) access.level = accessLevel;
      else {
        user.access.push({
          service: service._id,
          name: service.name,
          level: accessLevel,
        });
      }

      const updatedUser = await updateUser(user._id, user);

      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
    } catch (exception) {
      console.log("exception: ", exception);
    }
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="">
          Määritä käytäjäkohtaiset Käyttöoikeudet sovelluksiin
        </DialogTitle>
        <DialogDescription>
          Tee muutoksia käyttäjän käyttöoikeuksiin. Paina Tallenna, kun olet
          valmis.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ul className="flex flex-col items-start">
            {fields.map((field, index) => (
              <li key={field.id} className="flex items-end gap-4 py-2">
                <FormField
                  control={form.control}
                  name={`user.${index}.accesslevel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Käyttöoikeustaso</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-52">
                            <SelectValue placeholder="Valitse käyttötaso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Käyttötaso</SelectLabel>
                            {accessLevels.map((a) => (
                              <SelectItem
                                key={a.accessLevel}
                                value={a.accessLevel.toString()}
                              >
                                {a.role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`user.${index}.app`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sovellus</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-52">
                            <SelectValue placeholder="Valitse sovellus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Sovellus</SelectLabel>
                            {services?.map((s) => (
                              <SelectItem key={s._id} value={s._id.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">poista sovellus</span>
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => append({ accesslevel: 1, app: "service-unknown" })}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">lisaa sovellus</span>
            </Button>
            <Button variant="default" type="submit">
              Tallenna
            </Button>
          </div>
        </form>
      </Form>
      <DialogFooter>
        <Button variant="destructive" onClick={() => console.log("poista")}>
          Poista
        </Button>
        <Button variant="default" onClick={uploadAccessLevel}>
          Tallenna
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function TableOptions({ u }: { u: User }) {
  const users = useUserStore((state) => state.users);
  const setUsers = useUserStore((state) => state.setUsers);
  const [open, setOpen] = useState(false);

  async function toggleAdmin(u: User) {
    try {
      u.admin = !u.admin;
      const updatedUser = await updateUser(u._id, u);

      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
    } catch (exception) {
      console.log("exception: ", exception);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="inline-flex items-center justify-center h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DialogTrigger asChild>
              <DropdownMenuItem>Määritä</DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={() => toggleAdmin(u)}>
              {u.admin ? "Poista oikeudet" : "Anna oikeudet"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (confirm("Oletko varma että haluat poistaa käyttäjän?")) {
                  await removeUser(u._id);
                  setUsers(users.filter((user) => user._id !== u._id));
                }
              }}
            >
              poista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SetAccessLevel user={u} />
      </Dialog>
    </>
  );
}

export default function Users() {
  const user = useUserStore((state) => state.user);
  const users = useUserStore((state) => state.users);
  const setUsers = useUserStore((state) => state.setUsers);
  const services = useServiceStore((state) => state.services);
  const setServices = useServiceStore((state) => state.setServices);

  const loadUsers = useCallback(async () => {
    if (user && user.admin) {
      try {
        setUsers(await getAllUsers());
      } catch (exception) {
        console.log("exception: ", exception);
      }
    }
  }, [setUsers, user]);

  const loadServices = useCallback(async () => {
    if (user && user.admin) {
      try {
        setServices(await getAllServices());
      } catch (exception) {
        console.log("exception: ", exception);
      }
    }
  }, [setServices, user]);

  useEffect(() => {
    loadUsers();
    loadServices();
  }, [loadServices, loadUsers, user]);

  if (!user || !user.admin) {
    return (
      <main className="flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4">
        <h2 className="text-3xl">
          Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.
        </h2>
        <Link to="/" className="opacity-70 hover:opacity-100 hover:underline">
          Mene takasin etusivulle
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center px-4 pb-2 pt-4 sm:px-8 sm:py-4">
      <div className="flex flex-col items-start w-full max-w-5xl gap-2">
        <h2 className="text-3xl font-bold">
          Virittämö portaalin Käyttöoikeuksien Hallinta
        </h2>
        <p className="opacity-70">
          Tällä sivulla järjestelmänvalvoja voi muokata käyttäjien
          palvelukohtaisia käyttöoikeuksia. Käyttöoikeuksien muutokset tulevat
          voimaan kun käyttäjä kirjautuu ulos ja takaisin sisään, tai
          viimeistään kahden päivän kuluttua muutoksesta, kun käyttäjän token
          vanhenee ja hän joutuu kirjautumaan uudelleen sisään.
        </p>
        <Table>
          <TableCaption>Lista Käyttöoikeuksita käyttäjillä</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sähköposti</TableHead>
              <TableHead>Käyttöoikeustasot</TableHead>
              <TableHead>Rooli</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .sort((a, b) => (a.email > b.email ? 1 : -1))
              .map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <ul className="flex flex-col">
                      {u.access.map((a) => {
                        const service = services?.find(
                          (s) => s._id === a.service
                        );

                        const access = accessLevels.find(
                          (level) => level.accessLevel === a.level
                        );

                        if (!service) return null;

                        return (
                          <li
                            key={a.service + u._id}
                            className="flex gap-1 items-center"
                          >
                            <p className="text-xs opacity-70">
                              {service.name}:
                            </p>
                            <span className="text-xs">{access?.role}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </TableCell>
                  <TableCell>{u.admin ? "Admin" : "User"}</TableCell>
                  <TableCell>
                    <TableOptions u={u} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
