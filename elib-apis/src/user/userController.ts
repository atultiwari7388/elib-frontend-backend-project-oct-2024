import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import userModel from './userModel'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { config } from '../config/config'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body
  //validation
  if (!name || !email || !password) {
    const err = createHttpError(400, 'All Fields are required')
    return next(err)
  }
  //database call
  const user = await userModel.findOne({ email })
  if (user) {
    const error = createHttpError(400, 'User Already exists with this email')
    return next(error)
  }
  //password-hashed
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  })
  //token generation
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: '7d',
  })
  //response
  res.json({ accessToken: token })
}

export { createUser }
