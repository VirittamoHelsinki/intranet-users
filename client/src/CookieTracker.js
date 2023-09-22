import { useEffect } from 'react'
import Cookies from 'universal-cookie'

import authorizeApi from './api/authorize'
import userApi from './api/users'
import useStore from './store'

const CookieTracker = () => {
  const { setUser } = useStore()

  useEffect(() => {
    loadCookies()
  }, [])

  const loadCookies = async () => {
    const cookies = new Cookies()
    const usersToken = cookies.get('usersToken')

    if (usersToken) {

      // Initialize the user state with the token from the cookie.
      authorizeApi.setToken(usersToken)

      try {
        // Load user information from the server.
        setUser(await userApi.get())
      
      } catch (error) {
        // If the token is invalid, remove the token cookie.
        cookies.remove('usersToken')
      }
    }
  }

  return null
}

export default CookieTracker
