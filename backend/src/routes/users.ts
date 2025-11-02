import express from 'express'
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js'
import { prisma } from '../database/prisma.js'

const router = express.Router()

// Get user profile
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if current user follows this user
    let isFollowing = false
    if (req.userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: req.params.id
          }
        }
      })
      isFollowing = !!follow
    }

    res.json({ ...user, isFollowing })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Update profile
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const { username, displayName, bio, avatar } = req.body

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        username,
        displayName,
        bio,
        avatar
      }
    })

    res.json(user)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Follow user
router.post('/:id/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: req.userId!,
        followingId: req.params.id
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.params.id,
        type: 'follow',
        fromUserId: req.userId,
        message: `${follow.following.displayName} started following you`
      }
    })

    // Emit real-time update
    const io = req.app.get('io')
    io?.to(`user-${req.params.id}`).emit('new-follower', follow)

    res.json(follow)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already following' })
    }
    res.status(500).json({ error: error.message })
  }
})

// Unfollow user
router.delete('/:id/follow', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.userId!,
          followingId: req.params.id
        }
      }
    })

    res.json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Like/Unlike post
router.post('/posts/:postId/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.postId,
          userId: req.userId!
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      
      const io = req.app.get('io')
      io?.emit('post-unliked', { postId: req.params.postId, userId: req.userId })
      
      return res.json({ liked: false })
    } else {
      // Like
      const like = await prisma.like.create({
        data: {
          postId: req.params.postId,
          userId: req.userId!
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

      // Create notification
      const post = await prisma.post.findUnique({
        where: { id: req.params.postId }
      })

      if (post && post.creatorId !== req.userId) {
        await prisma.notification.create({
          data: {
            userId: post.creatorId,
            type: 'like',
            postId: req.params.postId,
            fromUserId: req.userId,
            message: `${like.user.displayName} liked your post`
          }
        })
      }

      const io = req.app.get('io')
      io?.emit('post-liked', { postId: req.params.postId, like })
      io?.to(`user-${post?.creatorId}`).emit('new-like', like)

      res.json({ liked: true, like })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Comment on post
router.post('/posts/:postId/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' })
    }

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.postId,
        userId: req.userId!,
        content
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

    // Create notification
    const post = await prisma.post.findUnique({
      where: { id: req.params.postId }
    })

    if (post && post.creatorId !== req.userId) {
      await prisma.notification.create({
        data: {
          userId: post.creatorId,
          type: 'comment',
          postId: req.params.postId,
          fromUserId: req.userId,
          message: `${comment.user.displayName} commented on your post`
        }
      })
    }

    const io = req.app.get('io')
    io?.emit('new-comment', comment)
    io?.to(`user-${post?.creatorId}`).emit('post-commented', comment)

    res.json(comment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router

