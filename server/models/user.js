import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { secret } from "../utils/config.js";

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    validate: {
      validator: (v) => {
        return /.{2,}@.{2,}\..{2,}/.test(v);
      },
      invite: (props) => `${props.value} is not a valid email!`,
    },
  },
  firstname: String,
  lastname: String,
  passwordHash: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  access: [
    {
      // Service id.
      service: {
        type: ObjectId,
        ref: "Service",
      },
      level: {
        type: Number,
        required: true,
      },
      name: {
        // Services name so that access can be checked with just the token.
        type: String,
      },
    },
  ],
});

// Needs to use oldschool function syntax to access "this".
userSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstname: this.firstname,
      lastname: this.lastname,
      admin: this.admin,
      access: this.access,
    },
    secret,
    { expiresIn: "2d" }
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstname: this.firstname,
      lastname: this.lastname,
      admin: this.admin,
      access: this.access,
    },
    secret,
    { expiresIn: "7d" }
  );
};

userSchema.statics.format = (user) => {
  const { _id, email, firstname, lastname, admin, access } = user;

  return {
    _id,
    email,
    firstname,
    lastname,
    admin,
    access,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
