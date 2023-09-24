import { useState, useEffect } from 'react'

import usersApi from '../api/users'
import useStore from '../store'

const Users = () => {
    const {
        user,
        users,
        setUsers
    } = useStore()

    return (
        <div style={{
            margin: '20px',
            padding: '20px',
            maxWidth: '1000px'
        }}>
            <h4 style={{textAlign: 'center'}}>Intranetin Käyttöoikeuksien Hallinta</h4>
            <div>
                Tällä sivulla järjestelmänvalvoja voi muokata käyttäjien palvelukohtaisia
                käyttöoikeuksia. Käyttöoikeuksien muutokset tulevat voimaan kun käyttäjä
                kirjautuu ulos ja takaisin sisään, tai viimeistään kahden päivän kuluttua
                muutoksesta, kun käyttäjän token vanhenee ja hän joutuu kirjautumaan
                uudelleen sisään.
            </div>
        </div>
    )
}

export default Users