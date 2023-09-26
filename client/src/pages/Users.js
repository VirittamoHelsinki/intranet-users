import { useState, useEffect } from 'react'

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

function TableOptions({ u }) {
    const users = useStore((state) => state.users)

    const toggleAdmin = async u => {
        try {
            u.admin = !u.admin
            const updatedUser = await usersApi.update(u._id, u)

            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u))

        } catch (exception) { console.log('exception: ', exception) }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>
                    <SetAccessLevel user={u} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <button
                        onClick={() => toggleAdmin(u)}
                    >
                        {u.admin ? 'poista oikeudet' : 'anna oikeudet'}
                    </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <button
                        onClick={async () => {
                            if (confirm('Oletko varma että haluat poistaa käyttäjän?')) {
                                await usersApi.remove(u._id)
                                setUsers(users.filter(user => user._id !== u._id))
                            }
                        }}
                        className="buttonBlack"
                    >
                        poista
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const SetAccessLevel = ({ user }) => {
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
        <div className='flex flex-col'>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Määritä</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Määritä Käyttöoikeustaso</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
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
                                name={service ? service.name : ''}
                                value={service ? service._id : ''}
                                onChange={event =>
                                    setService(services.find(s => s._id === event.target.value))
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Fruits</SelectLabel>
                                        {services.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={uploadAccessLevel}>
                            tallenna
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
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
        <main className='flex flex-col min-h-0 flex-1 gap-3 px-4 py-2'>
            <h2 className='text-2xl font-bold'>Intranetin Käyttöoikeuksien Hallinta</h2>
            <p className='max-w-4xl'>
                Tällä sivulla järjestelmänvalvoja voi muokata käyttäjien palvelukohtaisia
                käyttöoikeuksia. Käyttöoikeuksien muutokset tulevat voimaan kun käyttäjä
                kirjautuu ulos ja takaisin sisään, tai viimeistään kahden päivän kuluttua
                muutoksesta, kun käyttäjän token vanhenee ja hän joutuu kirjautumaan
                uudelleen sisään.
            </p>
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
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
                                <SetAccessLevel u={u} />
                            </TableCell>
                            <TableCell>
                                <TableOptions u={u} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </main>
    )
}

export default Users
