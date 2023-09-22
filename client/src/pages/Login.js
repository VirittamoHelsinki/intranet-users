// node imports
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Cookies from 'universal-cookie'

// file imports
import { protocol } from '../config'
import '../styles/loginComponents.css'

import authenticateApi from '../api/authenticate'
import authorizeApi    from '../api/authorize'
import userApi         from '../api/users'

import useStore from '../store'

const Login = () => {
  const {
    user,
    allowedDomains,
    setUser
  } = useStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const domain = searchParams.get("domain")

  // /login/?domain=test
  //console.log('domain url parameter: ', domain)

  useEffect(() => {
    if (user && domain && allowedDomains.find(d => d === domain)) {
      
      // If the user is already logged in and the domain parameter is specified,
      // redirect the user to the external service with the service key.
      authorizeAndRedirectUserToService()
    }

  }, [ allowedDomains.length, user ])

  const authorizeAndRedirectUserToService = async () => {
    const data = await authorizeApi.authorizeForService(domain)
    
    window.location.href = `${protocol}://${domain}/?user_key=${data.user_key}`
  }

  if (domain && !allowedDomains.find(d => d === domain)) return (
    <div>
      <br/><br/>
      <h4>URL kentän domain parametrin arvo ei sisällä mitään sallituista sivuista.</h4>
    </div>
  )

  if (user) {
    return (
      <div>
        <br/><br/>
        <h4>Olet kirjautunut sisään sähköpostilla: {user.email}</h4>
      </div>
    )
  }

  const loginButton = async event => {
    event.preventDefault()

    const credentials = {
       email,
       password
    }

    let authenticatedUser = null
    
    try {
      if (domain) {
        // If an external service was specified with the domain parameter.
       authenticatedUser = await authenticateApi.authenticateForService(credentials, domain)
      } else {
        authenticatedUser = await authenticateApi.authenticate(credentials)
      }
    
    } catch (exception) { console.log('exception: ', exception) }
      
    if (authenticatedUser) {
      userApi.setToken(authenticatedUser.token)

      const cookies = new Cookies()

      cookies.set('usersToken', authenticatedUser.token, {
        // Cookie expires in 60 days.
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        path: '/'
      })

      setUser(authenticatedUser)
        
      if (domain) {
        // If an external service was specified with the domain parameter.
        window.location.href = `${protocol}://${domain}/?user_key=${authenticatedUser.user_key}`
     
      } else navigate('/')

    } else alert("Failed to login. Wrong email or password?")
  }

  return (
    <div >
    <br/>
    <br/>
    <div className="formContainer">
      <br/>
      <form onSubmit={loginButton}>
        <h3 className="headline">Kirjaudu Sisään Intranettiin</h3>

        <p className="infoParagraph" >
          Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
        </p>

        <div className="inputContainer">
        <div>
          <div>Sähköposti</div>
          <input
            type="text"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="textInput"
          />
        </div>
        <div style={{margin: '5px'}} />
        <div>
          <div>Salasana</div>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="textInput"
          />
        </div>
        <br/>

        <div>
          <input
            type="submit"
            value="Kirjaudu sisään"
            className="buttonBlack"
          />
        </div>

        <br/>
        <div>
          <Link to="/register" className="loginLink">
            Rekisteröidy
          </Link>
          <br/>
          <Link to="/resetpassword" href="" className="loginLink">
            Unohditko salasanan?
          </Link>
        </div>
        </div>
        <br/>
      </form>
    </div>
    </div>
  )
}


export default Login