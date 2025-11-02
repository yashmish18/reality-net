import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { prisma } from '../database/prisma.js'
import { uploadToIPFS } from '../services/ipfs.js'
import { analyzeEvent } from '../services/ai.js'
import multer from 'multer'

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

// Create new post
router.post('/', authenticate, upload.single('media'), async (req: AuthRequest, res) => {
  try {
    const { description, eventType, latitude, longitude, locationName, title } = req.body
    const file = req.file

    if (!file || !description || !req.userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Calculate media hash
    const crypto = await import('crypto')
    const mediaHash = crypto.createHash('sha256').update(file.buffer).digest('hex')

    // Upload to IPFS
    const ipfsCID = await uploadToIPFS(file.buffer, file.originalname)

    // AI analysis
    const analysis = await analyzeEvent(
      description,
      mediaHash,
      { lat: parseFloat(latitude), lng: parseFloat(longitude) }
    )

    // Create post
    const post = await prisma.post.create({
      data: {
        creatorId: req.userId,
        mediaHash,
        ipfsCID,
        mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
        description,
        title: title || description.slice(0, 100),
        eventType,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        locationName,
        authenticityScore: analysis.authenticity_score,
        trendingScore: analysis.trending_score
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            stakes: true
          }
        }
      }
    })

    // Emit real-time update
    const io = req.app.get('io')
    io?.emit('new-post', post)

    res.json(post)
  } catch (error: any) {
    console.error('Create post error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          take: 10
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          },
          orderBy: { amount: 'desc' },
          take: 20
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            stakes: true
          }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.json(post)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { creatorId: req.params.userId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            stakes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    res.json(posts)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Delete post
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.post.delete({
      where: { id: req.params.id }
    })

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

