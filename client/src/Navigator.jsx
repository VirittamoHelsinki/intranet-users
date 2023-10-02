// node imports
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
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
import { useStore } from './store'
import { portalUrl } from './config'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './components/ui/dropdown-menu'

import { Moon, Sun } from "lucide-react"

import { Button } from "./components/ui/button"
import { useTheme } from "./components/theme-provider"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function UserNav() {
    const {
        user,
        setUser,
    } = useStore()

    // Run when the logout button is pressed.
    const logout = async () => {
        await authorizeApi.logout()
        const cookies = new Cookies()
        cookies.remove('usersToken')
        setUser(null)
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <p className='text-xl cursor-pointer'>
                    {user.email.substring(0, user.email.lastIndexOf("@"))}
                </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email.substring(0, user.email.lastIndexOf("@"))}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Link to='/profile' className='w-full h-full'>
                            Käyttäjän tiedot
                        </Link>
                    </DropdownMenuItem>
                    {user?.admin && (
                        <>
                            <DropdownMenuItem>
                                <Link to='/services' className='w-full'>
                                    Palveluiden hallinta
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link to='/users' className='w-full'>
                                    Käyttöoikeuksien hallinta
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className='cursor-pointer' >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function Navbar() {
    const { pathname } = useLocation()
    const { user } = useStore()

    if (user) {
        return (
            <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
                <a href='/' className="relative whitespace-nowrap text-2xl font-title font-bold">
                    Intranet{" "}
                    <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
                        [admin]
                    </sup>
                </a>
                <nav className='flex items-center gap-5'>
                    <UserNav />
                    <ModeToggle />
                </nav>
            </header>
        )
    }
    return (
        <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
            <a href={portalUrl} className="relative whitespace-nowrap text-2xl font-title font-bold">
                Intranet{" "}
                <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
                    [admin]
                </sup>
            </a>
            <nav className='flex items-center gap-3'>
                {pathname === '/register' ? <Link to="/">Kirjaudu sisään</Link> : <Link to="/register">Rekisteröidy</Link>}
                <ModeToggle />
            </nav>
        </header>
    )
}


// Contains the navbar and the router.
export default function Navigator() {

    const { setPublicServices } = useStore()

    // Load the allowed domains from the server and save them to the state.
    const loadPublicServices = async () => {
        try {
            const services = await serviceApi.getAllPublic()
            setPublicServices(services)

        } catch (exception) { console.log('exception: ', exception) }
    }

    useEffect(() => {
        loadPublicServices()
    }, [])

    return (
        <div className='flex min-h-0 flex-1 flex-col'>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/:domain" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/:domain" element={<Login />} />

                    <Route path="/register" element={<Register />} />
                    <Route path="/register/:domain" element={<Register />} />

                    <Route path="/resetpassword" element={<Reset />} />

                    <Route path="/profile" element={<Profile />} />

                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:id" element={<ServiceForm />} />
                    <Route path="/services/add" element={<ServiceForm />} />

                    <Route path="/users" element={<Users />} />

                </Routes>

            </Router>
        </div >
    )
}
