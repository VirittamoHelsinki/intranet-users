import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import servicesApi from '../api/services'
import { useStore } from '../store'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"

// A form page for adding and editing services.
export default function ServiceForm() {
    const {
        user,
        services,
        setServices
    } = useStore()

    const [name, setName] = useState('')
    const [domain, setDomain] = useState('')
    const [protocol, setProtocol] = useState('https')
    const [serviceKey, setServiceKey] = useState('')

    const [editing, setEditing] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        if (editing) {
            const service = services.find(s => s._id === id)

            if (!service) return

            setName(service.name)
            setDomain(service.domain)
            setServiceKey(service.serviceKey)
        }
    }, [editing])

    useEffect(() => {
        if (id && id !== 'new') setEditing(true)
    }, [id])

    console.log('id: ', id)
    console.log('param: ', id && id !== 'new' ? true : false)

    if (!user || !user.admin) return (
        <main className='flex flex-col grow justify-center items-center gap-2 px-4 pb-2 pt-4 sm:px-8 sm:py-4'>
            <h2 className='text-3xl'>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h2>
            <Link to='/' className='opacity-70 hover:opacity-100 hover:underline'>Mene takasin etusivulle</Link>
        </main>
    )
    //TODO:Fix not being able to create new services
    const onSubmit = (event) => {
        event.preventDefault()

        const serviceObject = {
            name,
            domain,
            protocol,
            serviceKey
        }

        if (editing) {
            servicesApi.update(id, serviceObject)
                .then(returnedService => {
                    setServices(services.map(s => s._id !== id ? s : returnedService))
                    navigate('/services')
                })
                .catch(error => console.log('error: ', error))

        } else {
            servicesApi.create(serviceObject)
                .then(returnedService => {
                    setServices(services.concat(returnedService))
                    navigate('/services')
                })
                .catch(error => console.log('error: ', error))
        }
    }

    console.log('protocol: ', protocol)
    return (
        <main className='flex flex-col items-center'>
            <h2>
                {id ? 'Muokkaa palvelua' : 'Luo uusi palvelu'}
            </h2>
            <form onSubmit={onSubmit} className='flex flex-col gap-3 max-w-md'>
                <div>
                    <Label htmlFor="name">Palvelun nimi: </Label>
                    <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="domain">Palvelun domain: </Label>
                    <Input
                        type="text"
                        id="domain"
                        value={domain}
                        onChange={(event) => setDomain(event.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="serviceKey">Palvelun avain: </Label>

                    <Textarea
                        id="serviceKey"
                        rows="4"
                        cols="50"
                        value={serviceKey}
                        onChange={(event) => setServiceKey(event.target.value)}
                    />
                </div>
                <RadioGroup defaultValue="https" onValueChange={setProtocol}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="https" id="r2" />
                        <Label htmlFor="r2">
                            https
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="http" id="r1" />
                        <Label htmlFor="r1" >
                            http
                        </Label>
                    </div>
                </RadioGroup>
                <Button type="submit">Tallenna</Button>
            </form>
        </main>
    )
}
