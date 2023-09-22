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

import authorizeApi from './api/authorize'
import userApi from './api/users'
import commonApi from './api/common'
import useStore from './store'
import { portalUrl } from './config'

import './styles/styles.css'

// Contains the navbar and the router.
const Navigator = () => {
  
  const {
    user,
    setUser,
    setAllowedDomains
  } = useStore()

  // Load the allowed domains from the server and save them to the state.
  const loadAllowedDomains = async () => {
    try {
      const domains = await commonApi.getAll('/services/domains')
      setAllowedDomains(domains)
    
    } catch(exception) { console.log('exception: ', exception) }
  }

  useEffect(() => {
    loadAllowedDomains()
  }, [])


  // Run when the logout button is pressed.
  const logout = async () => {
    await authorizeApi.logout()
    authorizeApi.setToken(null)
    const cookies = new Cookies()
    cookies.remove('usersToken')
    setUser(null)
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
      <div >
        <Router>

          {renderNavbar()}

          <Routes>
            <Route path="/"                 element={ <Login />} />
            <Route path="/:domain"          element={ <Login />} />
            <Route path="/login"            element={ <Login />} />
            <Route path="/login/:domain"    element={ <Login />} />
            <Route path="/register"         element={ <Register />} />
            <Route path="/register/:domain" element={ <Register />} />
            <Route path="/resetpassword"    element={ <Reset />} />
            <Route path="/profile"          element={ <Profile />} />
          </Routes>

        </Router>
      </div >
  )
}

export default Navigator