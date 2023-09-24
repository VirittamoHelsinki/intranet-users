// node imports
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import servicesApi from '../api/services'
import useStore from '../store'


const Services = () => {
    const {
        user,
        services,
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
            <br/><br/>
            <h4>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    const showOrHideServiceKey = service => {
        service.showServiceKey = !service.showServiceKey

        setServices(services)
    }

    const serviceKeyElement = service => {
        if (service.showServiceKey) return (
            <span>
                palvelun avain: {service.serviceKey}
                <button onClick={() => showOrHideServiceKey(service)}>
                    piilota
                </button>
            </span>
        )

        return (
            <button onClick={() => showOrHideServiceKey(service)}>
                näytä palvelun avain
            </button>
        )
    }

    const renderService = service => {
        return (
            <div
                key={service._id}
                style={{
                    border: '1px solid black',
                    padding: '10px',
                    borderRadius: '5px',
                    background: 'lightgrey',
                }}
            >
                <div>nimi: {service.name}</div>
                <div>domain: {service.domain}</div>
                {serviceKeyElement(service)}
                <button onClick={() => navigate(`/services/${service._id}`)}>
                    muokkaa
                </button>
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
            </div>
        )
    }

    const renderServices = () => {
        if (!services || services.length === 0) return <div>0 Palvelua</div>

        return services.map(service => renderService(service))
    }

    return (
        <div style={{
            margin: '20px',
            padding: '20px',
            maxWidth: '1000px'
        }}>
            <h4 style={{textAlign: 'center'}}>Intranetin Palveluiden Hallinta</h4>
            <div>
                Tällä sivulla järjestelmänvalvoja voi lisätä, poistaa ja muokata järjestelmään
                kuuluvia palveluita ja säätää näiden käyttöoikeuksia.
            </div>
            <br/>
            <button onClick={() => navigate('/services/new')}>
                lisää uusi palvelu
            </button>
            <br/>
            <br/>
            {renderServices()}
            <br/>
        </div>
    )
        
}

export default Services