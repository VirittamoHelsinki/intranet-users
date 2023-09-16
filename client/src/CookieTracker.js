import { useEffect } from 'react'
import Cookies from 'universal-cookie'

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
      userApi.setToken(usersToken)

      try {
        // Load user information from the server.
        setUser(await userApi.get())
      
      } catch (error) {
        // If the token is invalid, remove it from the cookie.
        cookies.remove('usersToken')
      }
    }
  }

  return null
}

export default CookieTracker
