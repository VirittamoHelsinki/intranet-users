import { create } from "zustand";

export type Access = {
  service: string;
  level: number;
  name: string;
};

export type User = {
  _id: string;
  email: string;
  admin: boolean;
  access: Access[];
};

type UserState = {
  user: User | null;
  users: User[];
  setUser: (user: User) => void;
  setUsers: (users: User[]) => void;
};
export type Service = {
  _id: string;
  name: string;
  domain: string;
  protocol: "http" | "https";
  serviceKey: string;
};

type ServiceState = {
  publicServices?: Omit<Service, "serviceKey">[]; // Services here do not contain serviceKey
  services?: Service[]; // Services here contain the serviceKey
  setPublicServices: (publicServices: Omit<Service, "serviceKey">[]) => void;
  setServices: (services: Service[]) => void;
};

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  users: [],

  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
}));

export const useServiceStore = create<ServiceState>()((set) => ({
  publicServices: [],
  services: [],

  setPublicServices: (publicServices) => set({ publicServices }),
  setServices: (services) => set({ services }),
}));
