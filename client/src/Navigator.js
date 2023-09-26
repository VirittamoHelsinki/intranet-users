// node imports
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import Cookies from 'universal-cookie'

// file imports
import Login from './pages/Login'
import Register from './pages/Register'
import Reset from './pages/Reset'
import Profile from './pages/Profile'
import Services from './pages/Services'
import ServiceForm from './pages/ServiceForm'
import Users from './pages/Users'

import authorizeApi from './api/authorize'
import serviceApi from './api/services'
import useStore from './store'
import { portalUrl } from './config'

import './styles/styles.css'

// Contains the navbar and the router.
const Navigator = () => {
  
  const {
    user,
    setUser,
    setPublicServices,
  } = useStore()

  // Load public information about the services from the server and
  // save it to the state.
  const loadServices = async () => {
    try {
      const publicServices = await serviceApi.getAllPublic()
      setPublicServices(publicServices)
    
    } catch(exception) { console.log('exception: ', exception) }
  }

  useEffect(() => {
    loadServices()
  }, [])


  // Run when the logout button is pressed.
  const logout = async () => {
    await authorizeApi.logout()
    const cookies = new Cookies()
    cookies.remove('usersToken')
    setUser(null)
  }

  const renderAdminPageLinks = () => {
    if (!user || !user.admin) return null

    return [
      <Nav.Link as="span">
        <Link to="/services" className="navLinkStyle">
          Palveluiden hallinta
        </Link>
      </Nav.Link>,
      <Nav.Link as="span">
        <Link to="/users" className="navLinkStyle">
          Käyttöoikeuksien hallinta
        </Link>
    </Nav.Link>
    ]
  }

  

  const renderNavbar = () => {
    if (user) return (
      <Navbar  fixed="top" bg="navbar-style" variant="dark" expand="sm"
        collapseOnSelect
      >
        <Navbar.Brand>
          <a href={portalUrl} className="brandLinkStyle">
            Intranet
          </a>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          
          <Navbar.Collapse>
            <Nav>
              <Nav.Link as="span">
                <Link to="/" onClick={logout} className="navLinkStyle">
                  Kirjaudu ulos
                </Link>
              </Nav.Link>
              <Nav.Link as="span">
                <Link to="/profile" className="navLinkStyle">
                  Käyttäjän tiedot
                </Link>
              </Nav.Link>
              {renderAdminPageLinks()}
            </Nav>
          </Navbar.Collapse>
      </Navbar>
    )

    return (
      <Navbar  fixed="top" bg="navbar-style" variant="dark" expand="sm"
        collapseOnSelect
      >
        <Navbar.Brand>
          <a href={portalUrl} className="brandLinkStyle">
            Intranet
          </a>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse>
            <Nav>
              <Nav.Link as="span" >
                <Link to="/" className="navLinkStyle">Kirjaudu</Link>
              </Nav.Link>
              <Nav.Link as="span">
                <Link to="/register" className="navLinkStyle">Rekisteröidy</Link>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
      </Navbar>
    )
  }

  return (
      <div>
        <Router>

          {renderNavbar()}

          {/* This div is used to push the page content below the navbar. */}
          <div style={{marginTop: '70px'}}/>

          <Routes>
            <Route path="/"                 element={ <Login />} />
            <Route path="/:domain"          element={ <Login />} />
            <Route path="/login"            element={ <Login />} />
            <Route path="/login/:domain"    element={ <Login />} />
            
            <Route path="/register"         element={ <Register />} />
            <Route path="/register/:domain" element={ <Register />} />
            
            <Route path="/resetpassword"    element={ <Reset />} />
            
            <Route path="/profile"          element={ <Profile />} />
            
            <Route path="/services"         element={ <Services />} />
            <Route path="/services/:id"     element={ <ServiceForm />} />
            <Route path="/services/add"     element={ <ServiceForm />} />

            <Route path="/users"            element={ <Users />} />

          </Routes>

        </Router>
      </div >
  )
}

export default Navigator