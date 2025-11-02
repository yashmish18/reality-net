import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { prisma } from '../database/prisma.js'
import { stakeForVerification } from '../services/aptos.js'

const router = express.Router()

// Stake on post correctness
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId, amount, stakeType, txHash } = req.body

    if (!postId || !amount || !stakeType || !['correct', 'incorrect'].includes(stakeType)) {
      return res.status(400).json({ error: 'Invalid stake data' })
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user already staked on this post with same type
    const existingStake = await prisma.stake.findUnique({
      where: {
        postId_userId_stakeType: {
          postId,
          userId: req.userId,
          stakeType
        }
      }
    })

    if (existingStake) {
      return res.status(400).json({ error: 'Already staked with this type' })
    }

    // Create stake record
    const stake = await prisma.stake.create({
      data: {
        postId,
        userId: req.userId,
        amount: BigInt(amount),
        stakeType,
        txHash
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // Update post stakes totals
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (post) {
      await prisma.post.update({
        where: { id: postId },
        data: {
          totalStakedCorrect: stakeType === 'correct' 
            ? post.totalStakedCorrect + BigInt(amount)
            : post.totalStakedCorrect,
          totalStakedIncorrect: stakeType === 'incorrect'
            ? post.totalStakedIncorrect + BigInt(amount)
            : post.totalStakedIncorrect
        }
      })
    }

    // Create notification for post creator
    await prisma.notification.create({
      data: {
        userId: post?.creatorId || '',
        type: 'stake',
        postId,
        fromUserId: req.userId,
        message: `${stake.user.displayName} staked ${amount} REAL that this is ${stakeType}`
      }
    })

    // Emit real-time update
    const io = req.app.get('io')
    io?.to(`user-${post?.creatorId}`).emit('new-stake', stake)
    io?.emit('post-updated', { postId, stakeType, amount })

    res.json(stake)
  } catch (error: any) {
    console.error('Stake error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get stakes for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const stakes = await prisma.stake.findMany({
      where: { postId: req.params.postId },
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
      orderBy: [
        { amount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const correctStakes = stakes.filter(s => s.stakeType === 'correct')
    const incorrectStakes = stakes.filter(s => s.stakeType === 'incorrect')

    res.json({
      totalCorrect: correctStakes.reduce((sum, s) => sum + Number(s.amount), 0),
      totalIncorrect: incorrectStakes.reduce((sum, s) => sum + Number(s.amount), 0),
      stakes: stakes.map(s => ({
        ...s,
        amount: s.amount.toString()
      }))
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Resolve post (admin or creator)
router.post('/:postId/resolve', authenticate, async (req: AuthRequest, res) => {
  try {
    const { isCorrect } = req.body
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.params.postId },
      data: {
        resolved: true,
        resolutionCorrect: isCorrect
      }
    })

    // Emit resolution event
    const io = req.app.get('io')
    io?.emit('post-resolved', { postId: req.params.postId, isCorrect })

    res.json(updatedPost)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

