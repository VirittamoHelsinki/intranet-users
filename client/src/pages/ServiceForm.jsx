import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import servicesApi from "../api/services";
import { useStore } from "../utils/store";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { BadgeInfo, RefreshCw } from "lucide-react";
import clsx from "clsx";

function HelpMe({ children }) {
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
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

// A form page for adding and editing services.
export default function ServiceForm() {
  const { user, services, setServices } = useStore();

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [protocol, setProtocol] = useState("https");
  const [serviceKey, setServiceKey] = useState("");
  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

    useEffect(() => {
        if (id !== "new") setEditing(true);
    }, [id]);

  useEffect(() => {
    if (editing === true) {
      const service = services.find((s) => s._id === id);

      if (!service) return;

      setName(service.name);
      setDomain(service.domain);
      setProtocol(service.protocol);
      setServiceKey(service.serviceKey);
    }
  }, [editing]);


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

  const onSubmit = (event) => {
    event.preventDefault();

    const serviceObject = {
      name,
      domain,
      protocol,
      serviceKey,
    };

    if (editing) {
      servicesApi
        .update(id, serviceObject)
        .then((returnedService) => {
          setServices(
            services.map((s) => (s._id !== id ? s : returnedService)),
          );
          navigate("/services");
        })
        .catch((error) => console.log("error: ", error));
    } else {
      servicesApi
        .create(serviceObject)
        .then((returnedService) => {
          setServices(services.concat(returnedService));
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
        <form onSubmit={onSubmit} className="flex flex-col gap-3 max-w-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="name">Palvelun nimi</Label>
              <HelpMe>
                Anna lisättävälle sovellukselle nimi esim.
                `kauppakassi-sovellus` pienillä kirjaimilla. Sovelukset ovat
                portaaliin lisättäviä lisäominaisuuksia.{" "}
              </HelpMe>
            </div>
            <Input
              type="text"
              id="name"
              placeholder="kauppakassi-sovellus"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="domain">Palvelun domain</Label>
              <HelpMe>
                Anna sovelluksen subdomain- tai domain-osoite esim.
                `kuutio.intranet.com`, joka viitaa sovelluksen sijaintiin
                palvelimella tai pilvipalvelussa.
              </HelpMe>
            </div>
            <Input
              type="text"
              id="domain"
              placeholder="kuutio.intranet.com"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 w-96 max-w-sm">
            <div className="flex items-center gap-1">
              <Label htmlFor="serviceKey">Palvelun avain</Label>
              <HelpMe>
                Luo uniikki sovelusavain käyttäen auto generate-toimintoa tai
                käsin syöttämällä. Avainta voi muokata myöhemmin. Avain
                syötetään sovelluksen ympäristömuuttujiin .env-tiedostoon.
              </HelpMe>
            </div>
            <div className="flex w-full max-w-sm items-center gap-x-2">
              <Input id="serviceKey" value={serviceKey} onChange={(event)=> setServiceKey(event.target.value)} className="w-full" />
              <Button
                variant="ghost"
                type="button"
                onClick={() => setServiceKey(uuidv4())}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="sr-only">Luo uusi avain</span>
              </Button>
            </div>
          </div>
          <RadioGroup value={protocol} onValueChange={setProtocol}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="https" id="r2" />
              <Label htmlFor="r2">https</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="http" id="r1" />
              <div className="flex items-center gap-1">
                <Label htmlFor="r1">http</Label>
                <HelpMe>käytä vain kehitysversiossa</HelpMe>
              </div>
            </div>
          </RadioGroup>
          <Button type="submit">Tallenna</Button>
        </form>
      </div>
    </main>
  );
}
