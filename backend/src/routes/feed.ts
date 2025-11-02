import express from 'express'
import { optionalAuth, AuthRequest } from '../middleware/auth.js'
import { prisma } from '../database/prisma.js'

const router = express.Router()

// Get main feed (Instagram-like)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', sort = 'trending' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'trending') {
      orderBy = { trendingScore: 'desc' }
    } else if (sort === 'verified') {
      orderBy = { verified: 'desc', createdAt: 'desc' }
    } else if (sort === 'stakes') {
      // Order by total stake amount
      orderBy = [{ totalStakedCorrect: 'desc' }, { totalStakedIncorrect: 'desc' }]
    }

    const posts = await prisma.post.findMany({
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
      orderBy,
      skip,
      take: parseInt(limit as string)
    })

    // Add user's like status if authenticated
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        let userLiked = false
        if (req.userId) {
          const like = await prisma.like.findUnique({
            where: {
              postId_userId: {
                postId: post.id,
                userId: req.userId
              }
            }
          })
          userLiked = !!like
        }

        return {
          ...post,
          userLiked,
          totalStakedCorrect: post.totalStakedCorrect.toString(),
          totalStakedIncorrect: post.totalStakedIncorrect.toString()
        }
      })
    )

    res.json(postsWithLikes)
  } catch (error: any) {
    console.error('Feed error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get following feed
router.get('/following', optionalAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    // Get users being followed
    const follows = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true }
    })

    const followingIds = follows.map(f => f.followingId)

    if (followingIds.length === 0) {
      return res.json([])
    }

    const posts = await prisma.post.findMany({
      where: {
        creatorId: { in: followingIds }
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    })

    res.json(posts.map(p => ({
      ...p,
      totalStakedCorrect: p.totalStakedCorrect.toString(),
      totalStakedIncorrect: p.totalStakedIncorrect.toString()
    })))
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

