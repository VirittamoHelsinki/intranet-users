import { useState, useEffect } from 'react'

import servicesApi from '../api/services'
import usersApi from '../api/users'
import useStore from '../store'

import '../styles/styles.css'

const SetAccessLevel = ({ user }) => {
    const { services, users, setUsers } = useStore()

    const [accessLevel, setAccessLevel] = useState(1)
    const [service, setService] = useState(services[0])

    const uploadAccessLevel = async () => {
        try {
            const access = user.access.find(a => a.service === service._id)

            if (access) access.level = accessLevel
            else {
                user.access.push({
                    service: service._id,
                    level: accessLevel
                })
            }
            
            const updatedUser = await usersApi.update(user._id, user)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <div style={{
            background: '#aaa',
            borderRadius: '5px',
            padding: '5px'
        }}>
            määritä käyttöoikeustaso:
            <input
                type="text"
                size="4"
                value={accessLevel}
                onChange={event => setAccessLevel(Number(event.target.value))}
            />
            <select
                style={{margin: '5px'}}
                name={service ? service.name : ''}
                value={service ? service._id : ''}
                onChange={event => 
                    setService(services.find(s => s._id === event.target.value))
                }
            >
                {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button
                onClick={uploadAccessLevel}
                className="buttonBlack"
            >tallenna</button>
        </div>
    )
}

const Users = () => {
    const {
        user,
        users,
        services,
        setUsers,
        setServices
    } = useStore()

    const loadUsers = async () => {
        if (user && user.admin) {
            try {
                setUsers(await usersApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }

    const loadServices = async () => {
        if (user && user.admin) {
            try {
                setServices(await servicesApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }

    useEffect(() => {
        loadUsers()
        loadServices()
    }, [user])

    if (!user || !user.admin) return (
        <div>
            <h4>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h4>
        </div>
    )

    const toggleAdmin = async u => {
        try {
            u.admin = !u.admin
            const updatedUser = await usersApi.update(u._id, u)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))
            
        } catch (exception) { console.log('exception: ', exception) }
    }

    const renderUser = u => {

        return (
            <div key={u._id} style={{
                margin: '20px',
                padding: '20px',
                fontSize: '16px',
                maxWidth: '1200px',
                height: 'auto',
                color: 'black',
                background: '#ddd',
                borderRadius: '5px'
            }}>
                <div style={{border: 'solid black', margin: '5px', padding: '5px'}}>
                    Sähköposti: {u.email}
                </div>
                <div style={{border: 'solid black', margin: '5px', padding: '5px'}}>
                <SetAccessLevel user={u} />
                <div style= {{
                    borderRadius: '5px',
                    padding: '5px'
                }}>
                    {u.access && u.access.length > 0
                        ? <div>Käyttöoikeustasot:</div>
                        : null
                    }
                    {u.access.map(a => {
                        const service = services.find(s => s._id === a.service)

                        if (!service) return null

                        return (
                            <div key={a.service + u._id}>
                                {service.name}: {a.level}
                            </div>
                        )
                    })}
                </div>
                </div>
                <button
                    onClick={() => toggleAdmin(u)}
                    className="buttonBlack"
                >
                    {u.admin ? 'poista admin oikeudet' : 'anna admin oikeudet'}
                </button>
                <button
                    onClick={ async () => {
                        if (confirm('Oletko varma että haluat poistaa käyttäjän?')) {
                            await usersApi.remove(u._id)
                            setUsers(users.filter(user => user._id !== u._id))
                        }
                    }}
                    className="buttonBlack"
                    style={{float: 'right'}}
                >
                    poista käyttäjä
                </button>
            </div>
        )
    }

    return (
        <div 
        style={{
            margin: '20px',
            padding: '20px',
            maxWidth: '1200px'
        }}>
            <h4 style={{textAlign: 'center'}}>Intranetin Käyttöoikeuksien Hallinta</h4>
            <div>
                Tällä sivulla järjestelmänvalvoja voi muokata käyttäjien palvelukohtaisia
                käyttöoikeuksia. Käyttöoikeuksien muutokset tulevat voimaan kun käyttäjä
                kirjautuu ulos ja takaisin sisään, tai viimeistään kahden päivän kuluttua
                muutoksesta, kun käyttäjän token vanhenee ja hän joutuu kirjautumaan
                uudelleen sisään.
            </div>
            {users.map(u => renderUser(u))}

        </div>
    )
}

export default Users