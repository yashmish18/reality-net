import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react'

interface PostCardProps {
  post: {
    id: string
    creator: {
      id: string
      username: string
      displayName: string
      avatar?: string
    }
    title?: string
    description: string
    ipfsCID: string
    mediaType: string
    verified: boolean
    verifierCount: number
    challengerCount: number
    totalStakedCorrect: string
    totalStakedIncorrect: string
    resolved?: boolean
    resolutionCorrect?: boolean
    authenticityScore?: number
    createdAt: string
    userLiked?: boolean
    _count?: {
      likes: number
      comments: number
      stakes: number
    }
  }
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onStake?: (postId: string, stakeType: 'correct' | 'incorrect', amount: number) => void
}

export default function PostCard({ post, onLike, onComment, onStake }: PostCardProps) {
  const { connected } = useWallet()
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [stakeType, setStakeType] = useState<'correct' | 'incorrect'>('correct')
  const [stakeAmount, setStakeAmount] = useState('1')

  const handleStake = () => {
    if (onStake && connected) {
      const amount = parseFloat(stakeAmount) * 1e9 // Convert to smallest unit
      onStake(post.id, stakeType, amount)
      setShowStakeModal(false)
    }
  }

  const correctTotal = parseFloat(post.totalStakedCorrect || '0')
  const incorrectTotal = parseFloat(post.totalStakedIncorrect || '0')
  const totalStaked = correctTotal + incorrectTotal
  const correctPercentage = totalStaked > 0 ? (correctTotal / totalStaked) * 100 : 50

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden mb-6"
      >
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cosmic-purple to-cosmic-blue flex items-center justify-center">
              {post.creator.avatar ? (
                <img src={post.creator.avatar} alt={post.creator.displayName} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-white font-semibold">
                  {post.creator.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{post.creator.displayName || post.creator.username}</span>
                {post.verified && (
                  <CheckCircle2 className="w-4 h-4 text-cosmic-cyan" />
                )}
              </div>
              <span className="text-xs text-gray-400">@{post.creator.username}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Post Media */}
        <div className="relative">
          <img
            src={`https://ipfs.io/ipfs/${post.ipfsCID}`}
            alt={post.description}
            className="w-full max-h-[600px] object-contain bg-black"
          />
          {post.resolved !== undefined && post.resolved && (
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-lg ${
              post.resolutionCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
            }`}>
              <div className="flex items-center space-x-2">
                {post.resolutionCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold ${post.resolutionCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {post.resolutionCorrect ? 'Verified Correct' : 'Verified Incorrect'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-4 space-y-3">
          <div>
            {post.title && (
              <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
            )}
            <p className="text-gray-300">{post.description}</p>
          </div>

          {/* Staking Stats */}
          {totalStaked > 0 && (
            <div className="glass rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Correct: {(correctTotal / 1e9).toFixed(2)} REAL</span>
                </div>
                <div className="flex items-center space-x-2 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  <span>Incorrect: {(incorrectTotal / 1e9).toFixed(2)} REAL</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all"
                  style={{ 
                    background: `linear-gradient(to right, #10b981 ${correctPercentage}%, #ef4444 ${correctPercentage}%)`
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                {correctPercentage.toFixed(1)}% believe this is correct
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLike?.(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  post.userLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.userLiked ? 'fill-current' : ''}`} />
                <span>{post._count?.likes || 0}</span>
              </button>

              <button
                onClick={() => onComment?.(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-cosmic-cyan transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post._count?.comments || 0}</span>
              </button>

              {!post.resolved && connected && (
                <button
                  onClick={() => setShowStakeModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-semibold">Stake</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>✓ {post.verifierCount}</span>
              <span>✗ {post.challengerCount}</span>
              {post.authenticityScore && (
                <span>Score: {post.authenticityScore.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stake Modal */}
      {showStakeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowStakeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Stake on Truth</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Position</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStakeType('correct')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      stakeType === 'correct'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-white/20 glass hover:border-green-500/50'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Correct</div>
                  </button>
                  <button
                    onClick={() => setStakeType('incorrect')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      stakeType === 'incorrect'
                        ? 'border-red-500 bg-red-500/20 text-red-400'
                        : 'border-white/20 glass hover:border-red-500/50'
                    }`}
                  >
                    <TrendingDown className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold">Incorrect</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Stake Amount (REAL)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-cosmic-cyan"
                  placeholder="1.0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 px-4 py-3 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  disabled={!connected || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Stake
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

