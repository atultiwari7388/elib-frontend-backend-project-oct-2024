import express from 'express'

const app = express()

//Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Elib Apis' })
})

export default app
