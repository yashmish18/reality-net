import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { prisma } from '../database/prisma.js'

const router = express.Router()

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        post: {
          select: {
            id: true,
            mediaType: true,
            ipfsCID: true
          }
        }
      }
    })

    res.json(notifications)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    })

    res.json(notification)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId: req.userId!,
        read: false
      },
      data: { read: true }
    })

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

