import { create } from 'zustand'

// Create a custom hook called useStore using Zustand library
const useStore = create(set => ({
    // initial state variables
    user: null,
    allowedDomains: [],
    services: [],
    users: [],

    // actions
    setUser: user => set({ user }),
    setAllowedDomains: allowedDomains => set({ allowedDomains }),
    setServices: services => set({ services }),
    setUsers: users => set({ users })
}))

export default useStore