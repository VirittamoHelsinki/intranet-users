import useStore from '../store'

const Profile = () => {
  
  const { user } = useStore()

  if (!user) return (
    <div>
      <br/>
      <br/>
      <h3>Sinun tulee kirjautua sisään nähdäksesi tämän sivun.</h3>
    </div>
  )

  const { email, admin } = user

  return (
    <div>

      <br/>

      <div style={{
        marginLeft: '15px',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        <h2 style={{
          textAlign: 'center!important',
          alignContent: 'center!important'
        }}>
          Käyttäjän tiedot
        </h2>
        <br/>
        <p> Sähköposti: { email } </p>
        {admin ? <p> Olet järjestelmänvalvoja </p> : null}
      </div>

      <br/>

    </div>
  )
}

export default Profile
