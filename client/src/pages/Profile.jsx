import { useStore } from '../store'

export default function Profile() {
    const user = useStore((state) => state.user)
    if (!user) return (
        <main>
            <h2>Sinun tulee kirjautua sisään nähdäksesi tämän sivun.</h2>
        </main>
    )
    const { email, admin } = user

    return (
        <main className='flex flex-col justify-center items-center px-4 py-3'>
            <div className='flex flex-col items-start w-full max-w-sm gap-2'>
                <h2 className='text-3xl font-bold'>Käyttäjän tiedot</h2>
                <p className='opacity-70'>Sähköposti: {email}</p>
                {admin && <p>Olet järjestelmänvalvoja</p>}
            </div>
        </main>
    )
}
