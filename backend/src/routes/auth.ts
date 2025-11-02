import express from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../database/prisma.js'

const router = express.Router()

// Authenticate wallet and create/get user
router.post('/wallet', async (req, res) => {
  try {
    const { walletAddress, aptosAddress, signature } = req.body

    if (!walletAddress || !aptosAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          aptosAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
          displayName: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
        }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    res.json({ token, user })
  } catch (error: any) {
    console.error('Auth error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router

