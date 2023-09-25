const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const {
  requireAuthorization, userIsAdmin } = require('../middleware/authorize')

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
    console.log(exception.message)
    if (exception.message.includes('User validation failed')){
      res.status(400).json({ error: 'user validation failed' })
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
    let { _id } = res.locals.user

    // Fetch user to make sure that the user received is up to date.
    const user = await User.findById(_id)

    if (!user) return res.status(401).json({
      error: `Cannot find user with id: ${_id}`
    })

    res.json(User.format(user))

  } catch (exception) { next(exception) }
})


// From here on require that the user is an admin on all routes.
userRouter.all('*', userIsAdmin)


// Get all users.
userRouter.get('/all', async (req, res, next) => {
  try {
    const users = await User.find({})

    res.json(users.map(User.format))

  } catch (exception) { next(exception) }
})


// Delete a user.
userRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) return res.status(401).json({
      error: `Cannot find user with id: ${id}`
    })

    await User.findByIdAndRemove(id)

    res.status(204).end()

  } catch (exception) { next(exception) }
})


// An admin user can update any users admin and access rights.
userRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    let { admin, access } = req.body
    
    if (!admin && !access) {
      return res.status(400).json({ error: 'No valid fields to update.'})
    }

    // If an access level is marked 0, remove it from the list.
    if (access) access = access.filter(a => a.level != 0)

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { admin, access },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(400).json({ error: 'User does not exist.' })
    }

    res.json(User.format(updatedUser))

  } catch (exception) { next(exception) }
})


module.exports = userRouter
