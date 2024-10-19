import mongoose from 'mongoose'
import { config } from './config'

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Connected to database Successfully')
    })
    mongoose.connection.on('error', (err) => {
      console.log('Error in connecting databse.', err)
    })
    await mongoose.connect(config.databaseURL as string)
  } catch (error) {
    console.error('Failed to connect databse', error)
    process.exit(1)
  }
}

export default connectDB
