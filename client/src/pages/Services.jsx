import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import servicesApi from '../api/services'
import { useStore } from '../store'
import { Button } from '../components/ui/button'
import { ClipboardCopy, ClipboardX, EyeIcon, EyeOffIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'

function MoreOptions({ service }) {
    const {
        services,
        setServices
    } = useStore()
    const navigate = useNavigate()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => navigate(`/services/${service._id}`)}>
                    muokkaa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    servicesApi
                        .remove(service._id)
                        .then(() => {
                            setServices(services.filter(s => s._id !== service._id))
                        })
                        .catch(error => console.log('error: ', error))
                }}>
                    poista
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function CopyToClip({ service }) {
    const [copy, setCopy] = useState(false);
    const copyUrlToClipboard = (key) => {
        setCopy(true);
        navigator.clipboard.writeText(key);
        console.log('key', key)
        setTimeout(() => setCopy(false), 1000);
    };
    return (
        <Button
            className="-m-2 !p-2"
            onClick={() => copyUrlToClipboard(service.serviceKey)}
            variant="ghost"
        >
            {copy ? (
                <ClipboardX className="h-5 w-5 opacity-70" />
            ) : (
                <ClipboardCopy className='h-5 w-5' />
            )}
            <span className="sr-only">kopio avain</span>
        </Button>
    );
}

function ServiceItems() {
    const {
        services,
        setServices
    } = useStore()
    const [copy, setCopy] = useState(false);
    const copyUrlToClipboard = (key) => {
        setCopy(true);
        navigator.clipboard.writeText(key);
        console.log('key', key)
        setTimeout(() => setCopy(false), 1000);
    };

    const showOrHideServiceKey = (service) => {
        service.showServiceKey = !service.showServiceKey

        setServices(services)
    }

    if (!services || services.length === 0) return <div>0 Palvelua</div>

    return services.map(service => (
        <TableRow key={service._id}>
            <TableCell>{service.name}</TableCell>
            <TableCell>{service.protocol}</TableCell>
            <TableCell>{service.domain}</TableCell>
            <TableCell className='overflow-hidden'>
                {service.showServiceKey ? (
                    <button className='max-w-[100px]' onClick={() => copyUrlToClipboard(service.serviceKey)} >
                        <p>{copy ? 'kopioitu' : service.serviceKey}</p>
                    </button>
                ) : <p>********</p>}
            </TableCell>
            <TableCell className='flex gap-5'>
                <Button variant='ghost' className="p-2" onClick={() => showOrHideServiceKey(service)}>
                    {service.showServiceKey ? <EyeOffIcon className='h-5 w-5' /> : <EyeIcon className='h-5 w-5' />}
                </Button>
                {/*<CopyToClip service={service} />*/}
            </TableCell>
            <TableCell>
                <MoreOptions service={service} />
            </TableCell>
        </TableRow>
    ))
}

export default function Services() {
    const {
        user,
        setServices
    } = useStore()

    const navigate = useNavigate()

    const getServices = async () => {
        if (user && user.admin) {
            try {
                let serviceEntries = await servicesApi.getAll()

                serviceEntries.forEach(s => s.showServiceKey = false)

                setServices(serviceEntries)

            } catch (exception) { console.log('exception: ', exception) }
        }
    }

    useEffect(() => {
        getServices()
    }, [user])

    if (!user || !user.admin) return (
        <main className='flex flex-col grow justify-center items-center gap-2 px-4 py-3'>
            <h2 className='text-3xl'>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h2>
            <Link to='/' className='opacity-70 hover:opacity-100 hover:underline'>Mene takasin etusivulle</Link>
        </main>
    )

    return (
        <main className='flex flex-col justify-center items-center px-4 py-3'>
            <div className='flex flex-col items-start w-full max-w-5xl gap-2'>
                <h2 className='text-3xl'>Intranetin Palveluiden Hallinta</h2>
                <p className='opacity-70'>
                    Tällä sivulla järjestelmänvalvoja voi lisätä, poistaa ja muokata järjestelmään
                    kuuluvia palveluita ja säätää näiden käyttöoikeuksia.
                </p>
                <Button variant='outline' className='' onClick={() => navigate('/services/new')}>
                    <PlusIcon />
                    <span className="sr-only">Lisää palvelu</span>
                </Button>
                <Table>
                    <TableCaption>Lista Intranetin Palveluisti</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-56">Nimi</TableHead>
                            <TableHead className='w-20'>Protokolla</TableHead>
                            <TableHead className='w-56'>Domain</TableHead>
                            <TableHead className='w-40'>Avain</TableHead>
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-10 text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <ServiceItems />
                    </TableBody>
                </Table>
            </div>
        </main>
    )

}
