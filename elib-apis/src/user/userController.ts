import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'
import userModel from './userModel'

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
  //process
  //response
  res.json({ message: 'User Created' })
}

export { createUser }
