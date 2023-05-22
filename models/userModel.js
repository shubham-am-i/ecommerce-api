import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return // will avoid double hashing the password
  this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.createJWT = function () {
  // return token
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
}

UserSchema.methods.attachCookiesToResponse = ({ res, user }) => {
  const token = user.createJWT()
  const oneDay = 1000 * 60 * 60 * 24
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  })
}

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password) // return boolean
}

export default mongoose.model('User', UserSchema)
