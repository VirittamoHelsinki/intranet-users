import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import servicesApi from '../api/services'
import useStore from '../store'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"

// A form page for adding and editing services.
const ServiceForm = () => {
    const {
        user,
        services,
        setServices
    } = useStore()

    const [name, setName] = useState('')
    const [domain, setDomain] = useState('')
    const [protocol, setProtocol] = useState('https')
    const [serviceKey, setServiceKey] = useState('')

    console.log('rendering ServiceForm')

    const [editing, setEditing] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        if (editing) {
            const service = services.find(s => s._id === id)

            if (!service) return

            setName(service.name)
            setDomain(service.domain)
            setProtocol(service.protocol)
            setServiceKey(service.serviceKey)
        }
    }, [editing, services.length])

    useEffect(() => {
        if (id && id !== 'new') setEditing(true)
    }, [id])

    if (!user || !user.admin) return (
        <div>
            <br /><br />
            <h4>Vain järjestelmän valvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    const onSubmit = event => {
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

    return (
        <div className='flex flex-col  items-center'>
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
                <RadioGroup value={protocol}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="http"
                            id="r1"
                            onClick={() => setProtocol('http')}
                        />
                        <Label htmlFor="r1">
                            http
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem
                            value="https"
                            id="r2"
                            onClick={() => setProtocol('https')}
                        />
                        <Label htmlFor="r2">
                            https
                        </Label>
                    </div>
                </RadioGroup>
                <Button type="submit">Tallenna</Button>
            </form>
        </div>
    )
}

export default ServiceForm
