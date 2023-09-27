// node imports
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Cookies from 'universal-cookie'

// file imports
import userApi         from '../api/users'
import authorizeApi    from '../api/authorize'
import authenticateApi from '../api/authenticate'
import useStore        from '../store'

const Register = () => {
  const {
    user,
    setUser,
    publicServices
  } = useStore()

  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const domain = searchParams.get("domain")

  // /register/?domain=test
  console.log('domain url parameter: ', domain)

  if (domain && !publicServices.find(s => s.domain === domain)) return (
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

  const validate = () => {
    if (password.length < 11) {
      alert("password is too short")
      return false

    } if (password !== passwordCheck) {
      alert("passwords do not match.")
      return false

    } if (email.length < 5) {
      alert("email is too short to be valid")
      return false

    } if (!email.includes('@')) {
      alert("email is invalid")
      return false
    }

    return true
  }

  const registerAndLogin = async event => {
    event.preventDefault()

    if (!validate()) return

    const credentials = {
      password,
      email
    }

    try {
      await userApi.create(credentials)

      const authenticatedUser = await authenticateApi.authenticate(credentials)

      if (authenticatedUser) {
        authorizeApi.setToken(authenticatedUser.token)
        const cookies = new Cookies()

        cookies.set('usersToken', authenticatedUser.token, {
          // Cookie expires in 60 days.
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
          path: '/'
        })

        setUser(authenticatedUser)

        navigate('/')

      } else alert("Failed to login")

    } catch (exception) {
      alert("Registration failed on the server.")
    }

  }

  return (
    <div className="baseContainer" >
    <br/>
    <br/>
    <div className="formContainer" >
      <br/>
      <form onSubmit={registerAndLogin}>
        <h3 className="headline">Rekisteröidy Intranettiin</h3>

        <p className="infoParagraph" >
          Muista käyttää etunimi.sukunimi@edu.hel.fi sähköpostia
        </p>

        <div>
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
        <div style={{margin: '5px'}} />
        <div>
          <div>Salasana uudelleen</div>
          <input
            type="password"
            value={passwordCheck}
            onChange={event => setPasswordCheck(event.target.value)}
            className="textInput"
          />
        <br/>
        <br/>
        </div>
        <input
          type="submit"
          value="Rekisteröidy"
          className="buttonBlack"
        />
        <br/>
        <br/>
        <div>
          <Link to="/login" className="loginLink">
            Kirjaudu
          </Link>
          <br/>
          <Link to="/resetpassword" className="loginLink">
            Unohditko salasanan?
          </Link>
        </div>
        <br/>
      </div>
      </form>
    </div>
    </div>
  )
}

export default Register
