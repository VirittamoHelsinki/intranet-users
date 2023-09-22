// node imports
import { useState, useEffect } from 'react'
import { useNavigate, } from 'react-router-dom'

import servicesApi from '../api/services'
import useStore from '../store'


const Services = () => {
    const {
        user,
        services,
        setServices
    } = useStore()

    const getServices = async () => {
        if (user && user.admin) {
            try {
                let serviceEntries = await servicesApi.getAll()
                console.log('serviceEntries: ', serviceEntries)
                serviceEntries.forEach(s => s.showDomainKey = false)
                
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
            <h4>Vain järjestelmän valvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    const showOrHideDomainKey = service => {
        service.showDomainKey = !service.showDomainKey

        setServices(services)
    }

    const domainKeyElement = service => {
        if (service.showDomainKey) return (
            <span>
                domain avain: {service.domainKey}
                <button onClick={() => showOrHideDomainKey(service)}>
                    piilota
                </button>
            </span>
        )

        return (
            <button onClick={() => showOrHideDomainKey(service)}>
                näytä domain avain
            </button>
        )
    }

    const renderServices = () => {
        if (!services || services.length === 0) return <div>0 Palvelua</div>

        return services.map(service => 
            <div key={service.id}>
                <div>nimi: {service.name}</div>
                <div>domain: {service.domain}</div>
                {domainKeyElement(service)}
            </div>
        )
    }

    return (
        <div>
            <br/><br/>
            <h4>Intranet Palveluiden Hallinta</h4>
            <div>
                Tällä sivulla järjestelmän valvoja voi lisätä uusia palveluita
                autorisoitujen palveluiden joukkoon, ja säätää näiden käyttöoikeuksia.
            </div>
            <br/>
            {renderServices()}
            <br/>
        </div>
    )
        
}

export default Services