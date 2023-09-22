import { create } from 'zustand'

// Create a custom hook called useStore using Zustand library
const useStore = create(set => ({
    // initial state variables
    user: null,
    allowedDomains: [],
    services: [],

    // actions
    setUser: user => set({ user }),
    setAllowedDomains: allowedDomains => set({ allowedDomains }),
    setServices: services => set({ services })
}))

export default useStore