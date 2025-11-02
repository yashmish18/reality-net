import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  walletAddress?: string
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    req.userId = decoded.userId
    req.walletAddress = decoded.walletAddress
    
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
      req.userId = decoded.userId
      req.walletAddress = decoded.walletAddress
    }
    next()
  } catch (error) {
    next()
  }
}

