import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import PostCard from '../components/PostCard'
import MintTokenButton from '../components/MintTokenButton'
import { api } from '../services/api'
import { stakeForVerification } from '../services/aptos'
import { checkRealBalance } from '../services/realToken'

export default function Feed() {
  const { connected, address, aptos } = useWallet()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [realBalance, setRealBalance] = useState<number | null>(null)

  useEffect(() => {
    loadFeed()
    if (connected && address) {
      checkBalance()
    }
  }, [connected, address])

  const checkBalance = async () => {
    if (!address) return
    try {
      const balance = await checkRealBalance(address)
      setRealBalance(balance)
    } catch (error) {
      console.error('Error checking balance:', error)
    }
  }

  const loadFeed = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/feed', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!connected) {
      alert('Please connect your wallet')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/users/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, userLiked: data.liked, _count: { ...p._count, likes: data.liked ? p._count.likes + 1 : p._count.likes - 1 } }
          : p
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = (postId: string) => {
    const content = prompt('Enter your comment:')
    if (!content || !connected) return

    const token = localStorage.getItem('token')
    fetch(`http://localhost:4000/api/users/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    })
      .then(res => res.json())
      .then(() => loadFeed())
      .catch(console.error)
  }

  const handleStake = async (postId: string, stakeType: 'correct' | 'incorrect', amount: number) => {
    if (!connected || !address) {
      alert('Please connect your wallet')
      return
    }

    // Check REAL balance first
    const balance = await checkRealBalance(address)
    if (balance < amount) {
      alert(`Insufficient REAL tokens. You have ${(balance / 1e9).toFixed(2)} REAL, need ${(amount / 1e9).toFixed(2)} REAL.\n\nPlease mint REAL tokens first!`)
      return
    }

    try {
      // First stake on-chain
      const txHash = await stakeForVerification(aptos, address, amount, postId)
      
      // Then record in database
      const token = localStorage.getItem('token')
      await fetch('http://localhost:4000/api/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          amount: amount.toString(),
          stakeType,
          txHash
        })
      })

      alert(`Staked successfully! Transaction: ${txHash}`)
      await checkBalance()
      loadFeed()
    } catch (error: any) {
      console.error('Staking error:', error)
      const errorMsg = error.message || String(error)
      
      if (errorMsg.includes('Insufficient balance') || errorMsg.includes('could not find a stored value')) {
        alert('You need REAL tokens to stake. Please mint REAL tokens first using the button above.')
      } else {
        alert(`Failed to stake: ${errorMsg}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="pt-20 container mx-auto px-4 text-center">
        <div className="text-xl text-gray-400">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="pt-20 container mx-auto px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
          Reality Feed
        </h1>
        <div className="flex items-center gap-4">
          {connected && realBalance !== null && (
            <div className="flex items-center gap-3">
              <div className="text-sm glass px-4 py-2 rounded-lg">
                REAL: {(realBalance / 1e9).toFixed(2)}
              </div>
              {realBalance === 0 && (
                <MintTokenButton onSuccess={checkBalance} />
              )}
            </div>
          )}
          <select className="px-4 py-2 glass rounded-lg">
            <option value="trending">Trending</option>
            <option value="recent">Recent</option>
            <option value="verified">Verified</option>
            <option value="stakes">Most Staked</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No posts yet. Be the first to share reality!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onStake={handleStake}
            />
          ))
        )}
      </div>
    </div>
  )
}

