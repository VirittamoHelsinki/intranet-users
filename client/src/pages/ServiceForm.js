import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import servicesApi from '../api/services'
import useStore from '../store'

// A form page for adding and editing services.
const ServiceForm = () => {
    const {
        user,
        services,
        setServices
    } = useStore()
    
    const [name,       setName]       = useState('')
    const [domain,     setDomain]     = useState('')
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

    if (!user || !user.admin) return (
        <div>
            <br/><br/>
            <h4>Vain järjestelmän valvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    const onSubmit = event => {
        event.preventDefault()

        const serviceObject = {
            name,
            domain,
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
        <div>
            <h3>
                {id ? 'Muokkaa palvelua' : 'Luo uusi palvelu'}
            </h3>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="name">Palvelun nimi: </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="domain">Palvelun domain: </label>
                    <input
                        type="text"
                        id="domain"
                        value={domain}
                        onChange={(event) => setDomain(event.target.value)}
                    />
                </div>
                <div>
                    <div htmlFor="serviceKey">Palvelun avain: </div>
                    
                    <textarea
                        id="serviceKey"
                        rows="4"
                        cols="50"
                        value={serviceKey}
                        onChange={(event) => setServiceKey(event.target.value)}
                    />
                </div>
                <div>
                    <button type="submit">Tallenna</button>
                </div>
            </form>
        </div>
    )
}

export default ServiceForm