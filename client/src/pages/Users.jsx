import React, { useState, useEffect } from 'react'

import servicesApi from '../api/services'
import usersApi from '../api/users'
import useStore from '../store'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'
import { MoreHorizontalIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));
function SetAccessLevel({ user, setOpen }) {
    const { services, users, setUsers } = useStore()

    const [accessLevel, setAccessLevel] = useState(1)
    const [service, setService] = useState(services[0])

    const uploadAccessLevel = async () => {
        try {
            const access = user.access.find(a => a.service === service._id)

            if (access) access.level = accessLevel
            else {
                user.access.push({
                    service: service._id,
                    level: accessLevel
                })
            }

            const updatedUser = await usersApi.update(user._id, user)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <DialogContent
            className="sm:max-w-[425px]"
        >
            <DialogHeader>
                <DialogTitle>Määritä Käyttöoikeustaso</DialogTitle>
                <DialogDescription>
                    Tee muutoksia käyttäjän käyttöoikeuksiin. Paina Tallenna, kun olet valmis.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-end gap-4 py-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="kayttooikeustaso" className="">
                        Käyttöoikeustaso
                    </Label>
                    <Input
                        id="name"
                        className="col-span-3"
                        value={accessLevel}
                        onChange={event => setAccessLevel(Number(event.target.value))}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Select
                        onValueChange={(value) =>
                            setService(services.find(s => s._id === value))
                        }>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Valitse Palvelu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Palvelut</SelectLabel>
                                {services.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={uploadAccessLevel}>
                    Tallenna
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

function TableOptions({ u }) {
    const [open, setOpen] = useState(false)
    const dropdownTriggerRef = React.useRef(null);
    const {users,  setUsers} = useStore()

    const toggleAdmin = async (u) => {
        try {
            u.admin = !u.admin
            const updatedUser = await usersApi.update(u._id, u)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger ref={dropdownTriggerRef}>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DialogTrigger asChild>
                        <DropdownMenuItem>Määritä</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuItem onClick={() => toggleAdmin(u)} >
                        {u.admin ? 'Poista oikeudet' : 'Anna oikeudet'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => {
                        if (confirm('Oletko varma että haluat poistaa käyttäjän?')) {
                            await usersApi.remove(u._id)
                            setUsers(users.filter(user => user._id !== u._id))
                        }
                    }}>
                        poista
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SetAccessLevel user={u} ref={dropdownTriggerRef} />
        </Dialog>
    )
}


const Users = () => {
    const {
        user,
        users,
        services,
        setUsers,
        setServices
    } = useStore()

    const loadUsers = async () => {
        if (user && user.admin) {
            try {
                setUsers(await usersApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }

    const loadServices = async () => {
        if (user && user.admin) {
            try {
                setServices(await servicesApi.getAll())

            } catch (exception) { console.log('exception: ', exception) }
        }
    }

    useEffect(() => {
        loadUsers()
        loadServices()
    }, [user])

    if (!user || !user.admin) return (
        <div>
            <h2>Vain järjestelmänvalvojilla on oikeus käyttää tätä sivua.</h2>
        </div>
    )

    return (
        <main className='flex flex-col justify-center items-center px-4 py-3'>
            <div className='flex flex-col items-start w-full max-w-5xl gap-2'>
                <h2 className='text-3xl font-bold'>Intranetin Käyttöoikeuksien Hallinta</h2>
                <p className='opacity-70'>
                    Tällä sivulla järjestelmänvalvoja voi muokata käyttäjien palvelukohtaisia
                    käyttöoikeuksia. Käyttöoikeuksien muutokset tulevat voimaan kun käyttäjä
                    kirjautuu ulos ja takaisin sisään, tai viimeistään kahden päivän kuluttua
                    muutoksesta, kun käyttäjän token vanhenee ja hän joutuu kirjautumaan
                    uudelleen sisään.
                </p>
                <Table>
                    <TableCaption>Lista Käyttöoikeuksita käyttäjillä</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Sähköposti</TableHead>
                            <TableHead>Käyttöoikeustasot</TableHead>
                            <TableHead>Rooli</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u._id}>
                                <TableCell className="font-medium">{u.email}</TableCell>
                                <TableCell>
                                    <ul className="flex flex-col">
                                        {u.access.map(a => {
                                            const service = services.find(s => s._id === a.service)

                                            if (!service) return null

                                            return (
                                                <li key={a.service + u._id}>
                                                    {service.name}: {a.level}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </TableCell>
                                <TableCell>
                                    {u.admin ? 'Admin' : 'User'}
                                </TableCell>
                                <TableCell>
                                    <TableOptions u={u} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </main>
    )
}

export default Users
