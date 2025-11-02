import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { prisma } from './database/prisma.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import stakeRoutes from './routes/stakes.js'
import feedRoutes from './routes/feed.js'
import notificationRoutes from './routes/notifications.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/stakes', stakeRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Make io available to routes
app.set('io', io)

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.io ready for connections`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export { io }

