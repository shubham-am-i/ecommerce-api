// native imports
import path from 'path'
import { fileURLToPath } from 'url'

// external imports
import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import 'express-async-errors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

// local imports
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
import connectDB from './db/connect.js'
// import routers
import authRouter from './routes/authRoutes.js'
dotenv.config()
const app = express()

// Middlewares
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.get('/api/v1', (req, res) => {
  console.log(req.signedCookies)
  res.send('ecommerce api')
})
// Mount Routers
app.use('/api/v1/auth', authRouter)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

const bootstrap = async () => {
  await connectDB()
  app.listen(port, () => console.log(`Server is running on port ${port}`.yellow.bold))
}

bootstrap()
