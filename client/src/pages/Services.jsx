// node imports
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import servicesApi from '../api/services'
import useStore from '../store'
import { Button } from '../components/ui/button'
import { EyeIcon, EyeOffIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'

function MoreOptions({ service }) {
    const {
        services,
        setServices
    } = useStore()

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
                <DropdownMenuItem>
                    <button onClick={() => navigate(`/services/${service._id}`)}>
                        muokkaa
                    </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <button onClick={() => {
                        servicesApi
                            .remove(service._id)
                            .then(() => {
                                setServices(services.filter(s => s._id !== service._id))
                            })
                            .catch(error => console.log('error: ', error))
                    }}>
                        poista
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ServiceItems() {
    const {
        services,
        setServices
    } = useStore()

    const showOrHideServiceKey = service => {
        service.showServiceKey = !service.showServiceKey

        setServices(services)
    }

    if (!services || services.length === 0) return <div>0 Palvelua</div>

    return services.map(service => (
        <TableRow key={service._id}>
            <TableCell>{service.name}</TableCell>
            <TableCell>{service.domain}</TableCell>
            <TableCell className='overflow-hidden'>
                {service.showServiceKey ? (
                    <div className='overflow-x-scroll max-w-[160px]'>
                        <p>{service.serviceKey}</p>
                    </div>
                ) : (
                    '********'
                )}
            </TableCell>
            <TableCell>
                <button onClick={() => showOrHideServiceKey(service)}>
                    {service.serviceKey ? <EyeIcon /> : <EyeOffIcon />}
                </button>
            </TableCell>
            <TableCell>
                <MoreOptions service={service} />
            </TableCell>
        </TableRow>
    ))
}

const Services = () => {
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
        <div>
            <br /><br />
            <h4>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    return (
        <main className='flex flex-col justify-center items-center px-4 py-3'>
            <h2>Intranetin Palveluiden Hallinta</h2>
            <p>
                Tällä sivulla järjestelmänvalvoja voi lisätä, poistaa ja muokata järjestelmään
                kuuluvia palveluita ja säätää näiden käyttöoikeuksia.
            </p>
            <div className='relative flex flex-col w-full justify-center items-center'>
                <Button variant='outline' className='' onClick={() => navigate('/services/new')}>
                    <PlusIcon />
                    <span className="sr-only">Lisää palvelu</span>
                </Button>
                <Table>
                    <TableCaption>Lista Intranetin Palveluisti</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-56">Nimi</TableHead>
                            <TableHead className='w-56'>Domain</TableHead>
                            <TableCell className='w-40'>Avain</TableCell>
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

export default Services
