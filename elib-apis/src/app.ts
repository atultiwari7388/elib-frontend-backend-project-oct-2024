import express from 'express'
import globalErrorHandler from './middlewares/globalErrorHandler'

const app = express()

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Elib Apis' })
})

// Use global error handler
app.use(globalErrorHandler)

export default app
