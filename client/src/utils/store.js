import { create } from "zustand";

// Create a custom hook called useStore using Zustand library
export const useStore = create((set) => ({
  // initial state variables
  user: null,

  // Services here do not contain serviceKey
  publicServices: [],

  // Services here contain the serviceKey
  services: [],

  users: [],

  // actions
  setUser: (user) => set({ user }),
  setPublicServices: (publicServices) => set({ publicServices }),
  setServices: (services) => set({ services }),
  setUsers: (users) => set({ users }),
}));
