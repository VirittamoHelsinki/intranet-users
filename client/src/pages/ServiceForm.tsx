import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { createService, updateService } from "~/api/services";
import { useUserStore, useServiceStore, type Service } from "~/utils/store";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/@/components/ui/radio-group";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/@/components/ui/tooltip";
import { BadgeInfo, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const appSchema = z.object({
    name: z.string(),
    domain: z.string(),
    appKey: z.string(),
    protocol: z.string(),
});

function HelpMe({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <BadgeInfo className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent align="start">
                    <p className="w-60">{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any | number | bigint) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16),
    );
}

export default function ServiceForm() {
    const user = useUserStore((state) => state.user);
    const services = useServiceStore((state) => state.services);
    const setServices = useServiceStore((state) => state.setServices);
    const [editing, setEditing] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    const form = useForm<z.infer<typeof appSchema>>({
        resolver: zodResolver(appSchema),
        defaultValues: {
            name: services[0].name || "",
            domain: services[0].domain || "",
            appKey: services[0].serviceKey || "",
            protocol: services[0].protocol || "https",
        },
    });

    useEffect(() => {
        if (id !== "new") setEditing(true);
    }, [id]);

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

    function onSubmit(value: z.infer<typeof appSchema>) {
        if (editing) {
            updateService(id, { name: value.name, domain: value.domain, protocol: value.protocol, serviceKey: value.appKey  })
                .then((returnedService: Service) => {
                    setServices(
                        services?.map((s) => (s._id !== id ? s : returnedService)) || [],
                    );
                    navigate("/services");
                })
                .catch((error) => console.log("error: ", error));
        } else {
            createService({ name: value.name, domain: value.domain, protocol: value.protocol, serviceKey: value.appKey })
                .then((returnedService: Service) => {
                    setServices(services?.concat(returnedService) || []);
                    navigate("/services");
                })
                .catch((error) => console.log("error: ", error));
        }
    };

    return (
        <main className="flex flex-col items-center">
            <div className={clsx("flex flex-col", id !== "new" ? "gap-4" : "gap-2")}>
                <h2 className="text-xl font-bold">
                    {id !== "new"
                        ? "Muokkaa sovelluksen tietoja"
                        : "Lisää uusi sovellus Virittämö portaaliin"}
                </h2>
                {id === "new" && (
                    <p className="text-sm opacity-70 pb-3">
                        Sovellukset ovat portaaliin lisättäviä lisäominaisuuksia.
                    </p>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-md">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sovelluksen nimi</FormLabel>
                                    <HelpMe>
                                        Anna lisättävälle sovellukselle nimi esim.
                                        `kauppakassi-sovellus` pienillä kirjaimilla. Sovelukset ovat
                                        portaaliin lisättäviä lisäominaisuuksia.{" "}
                                    </HelpMe>
                                    <FormControl>
                                        <Input placeholder="kauppakassi-sovellus" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="domain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sovelluksen domain</FormLabel>
                                    <HelpMe>
                                        Anna sovelluksen subdomain- tai domain-osoite esim.
                                        `kuutio.intranet.com`, joka viitaa sovelluksen sijaintiin
                                        palvelimella tai pilvipalvelussa.
                                    </HelpMe>
                                    <FormControl>
                                        <Input placeholder="kuutio.intranet.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="appKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sovelluksen avain</FormLabel>
                                    <HelpMe>
                                        Luo uniikki sovelusavain käyttäen auto generate-toimintoa tai
                                        käsin syöttämällä. Avainta voi muokata myöhemmin. Avain
                                        syötetään sovelluksen ympäristömuuttujiin .env-tiedostoon.
                                    </HelpMe>
                                    <FormControl>
                                        <Input placeholder="kauppakassi-sovellus" {...field} />
                                        <div className="flex w-full max-w-sm items-center gap-x-2">
                                            <Input id="serviceKey" value={field.value} onChange={field.onChange} className="w-full" />
                                            <Button
                                                variant="ghost"
                                                type="button"
                                                onClick={() => field.onChange(uuidv4())}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                <span className="sr-only">Luo uusi avain</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="protocol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Protokolla</FormLabel>
                                    <FormControl>
                                        <RadioGroup value={field.value} onValueChange={field.onChange}>
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="https" id="r2" />
                                                </FormControl>
                                                <FormLabel htmlFor="r2">https</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="http" id="r1" />
                                                </FormControl>
                                                <div className="flex items-center gap-1">
                                                    <FormLabel htmlFor="r1">http</FormLabel>
                                                    <HelpMe>käytä vain kehitysversiossa</HelpMe>
                                                </div>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )} />
                        <Button type="submit">Tallenna</Button>
                    </form>
                </Form>
            </div>
        </main>
    );
}
