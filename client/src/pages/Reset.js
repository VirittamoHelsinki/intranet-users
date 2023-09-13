// node imports
import { useState } from 'react'
import { Link } from 'react-router-dom'

// file imports
import resetApi from '../api/reset'
import useStore from '../store'

import '../styles/loginComponents.css'

const Reset = () => {
  const [email, setEmail] = useState('')

  const { user } = useStore()

  if (user) return (
    <div>
      <h5>This page is only available when you are not logged in.</h5>
    </div>
  )

  const resetPassword = async event => {
    event.preventDefault()
    console.log('Resetting password for: ' + email)
    const message = await resetApi.reset({ email })

    if (message.success) {
      alert('Password change link has been sent to your email address. It will expire in 10 minutes.')
    } else if (message.error) {
      alert('Reset failed,', message.error)
    }
  }

  return (
      <div>
      <br/>
      <br/>
      <div className="formContainer" >
        <br/>
        <h3 className="headline">Vaihda salasanaa</h3>

        <p className="infoParagraph" >
          Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
        </p>

        <form onSubmit={resetPassword} >
          <div>
          <div>Sähköposti</div>
          <input
            type="text"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="textInput"
          />
          </div>
          <br/>
          <input
            type="submit"
            value="Vaihda salasana"
            className="buttonBlack"
          />
          <br/>
          <br/>
          <div>
            <Link to="/login" className="loginLink"> Kirjaudu </Link>
            <br/>
            <Link to="/register" className="loginLink"> Rekisteröidy </Link>
          </div>
          <br/>
        </form>
      </div>
      </div>
  )
}

export default Reset
