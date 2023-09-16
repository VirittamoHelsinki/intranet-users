const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const { secret } = require('../config')

const { ObjectId } = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  email: {
    type: String,
        required: true,
        unique: true,
        minlength: 3,
        validate: {
            validator: v => {
              return /.{2,}@.{2,}\..{2,}/.test(v)
            },
            invite: props => `${props.value} is not a valid email!`
        }
  },
  passwordHash: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  access: [{
    service: String,
    level: Number
  }]
})

// Needs to use oldschool function syntax to access "this".
userSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    admin: this.admin,
    access: this.access
  }, secret,
  { expiresIn: '3d' })
}

userSchema.statics.format = user => {
  const { _id, email, admin, access } = user

  return {
    _id,
    email,
    admin,
    access
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
