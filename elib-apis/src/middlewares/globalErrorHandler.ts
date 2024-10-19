import { NextFunction, Request, Response, ErrorRequestHandler } from 'express'
import { HttpError } from 'http-errors'
import { config } from '../config/config'

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as HttpError).statusCode || 500 // Cast err to HttpError
  const errorMessage =
    (err as HttpError).message || 'An unexpected error occurred'

  res.status(statusCode).json({
    message: errorMessage,
    errorStack: config.env === 'Development' ? (err as HttpError).stack : '',
  })
}

export default globalErrorHandler
