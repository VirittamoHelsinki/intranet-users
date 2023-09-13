const mongoose = require('mongoose')

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
