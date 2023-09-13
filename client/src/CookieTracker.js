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

      // Load user information from the server.
      setUser(await userApi.get())
    }
  }

  return null
}

export default CookieTracker
