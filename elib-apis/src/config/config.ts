import { config as conf } from 'dotenv'
conf()

const _config = {
  port: process.env.PORT,
  databaseURL: process.env.MONGO_CONNECTION_URL,
}

export const config = Object.freeze(_config)
