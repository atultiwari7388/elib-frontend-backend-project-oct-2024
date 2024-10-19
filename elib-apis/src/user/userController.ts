import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body
  //validation
  if (!name || !email || !password) {
    const err = createHttpError(400, 'All Fields are required')
    return next(err)
  }
  //process
  //response
  res.json({ message: 'User Created' })
}

export { createUser }
