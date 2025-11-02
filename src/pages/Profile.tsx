import { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { motion } from 'framer-motion'

export default function Profile() {
  const { address, connected } = useWallet()
  const [stats, setStats] = useState({
    nftsMinted: 0,
    tokensStaked: 0,
    rewardsEarned: 0,
    verifications: 0,
    reputation: 100,
  })

  useEffect(() => {
    if (connected && address) {
      // Fetch user stats from blockchain
      // Mock data for now
      setStats({
        nftsMinted: 5,
        tokensStaked: 10000000,
        rewardsEarned: 2500000,
        verifications: 12,
        reputation: 150,
      })
    }
  }, [connected, address])

  if (!connected) {
    return (
      <div className="pt-20 container mx-auto px-4 text-center">
        <p className="text-xl text-gray-400">Please connect your wallet to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="pt-20 container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cosmic-cyan to-cosmic-pink bg-clip-text text-transparent">
        Profile
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 holographic rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Wallet Address</h2>
            <p className="text-gray-400 font-mono">{address}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: 'Reality NFTs Minted', value: stats.nftsMinted, icon: '🎥' },
            { label: '$REAL Staked', value: (stats.tokensStaked / 1e9).toFixed(2), icon: '💰' },
            { label: 'Rewards Earned', value: (stats.rewardsEarned / 1e9).toFixed(2), icon: '⭐' },
            { label: 'Verifications', value: stats.verifications, icon: '✅' },
            { label: 'Reputation Score', value: stats.reputation, icon: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-8"
      >
        <h2 className="text-2xl font-semibold mb-4">My Reality NFTs</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* User's NFTs would be displayed here */}
          <div className="glass rounded-xl p-6 text-center text-gray-400">
            No NFTs minted yet
          </div>
        </div>
      </motion.div>
    </div>
  )
}

