const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const { requireAuthorization } = require('../middleware/authorize')

const virittamoEmail = email => {
  if (email.endsWith('@edu.hel.fi')) return true
  if (email.endsWith('@hel.fi'))     return true

  return false
}

userRouter.post('/', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email)    return res.status(400).json({ error: 'email is missing' })
    if (!password) return res.status(400).json({ error: 'password is missing' })

    email = email.toLowerCase()

    // Check if the email is a valid for virittamo.
    // if (!virittamoEmail(email)) {
    //   return res.status(400).json({
    //     error: 'email must end with @edu.hel.fi or @hel.fi'
    //   })
    // }

    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      email,
      passwordHash
    })

    const savedUser = await user.save()

    res.json(User.format(savedUser))

  } catch (exception) {
    console.log(exception._message)
    if (exception.message.includes('User validation failed')){
      res.status(400).json({ error: 'username not unique' })
    } else {
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

// From here on require authentication on all routes.
userRouter.all('*', requireAuthorization)

// Update routes will be created here.

// A Client with a valid token can get their user data.
userRouter.get('/', async (req, res, next) => {
  try {
    const { user } = res.locals

    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


module.exports = userRouter
