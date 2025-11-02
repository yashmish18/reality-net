import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'

export default function Home() {
  const { connected } = useWallet()

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cosmic-cyan via-cosmic-pink to-cosmic-purple bg-clip-text text-transparent">
            RealityNet
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 mb-8">
            Proof of Reality on Aptos Blockchain
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            Upload verifiable real-world evidence as immutable Reality NFTs. 
            Stake to verify, challenge, and earn rewards for maintaining truth on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="px-8 py-4 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg"
            >
              Upload Reality Event
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 glass rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
            >
              Explore Reality Ledger
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: 'Mint Reality NFTs',
              description: 'Upload videos, images, GPS data with cryptographic proof',
              icon: '🎥',
            },
            {
              title: 'Stake & Verify',
              description: 'Earn $REAL tokens by verifying authentic events',
              icon: '✅',
            },
            {
              title: 'Decentralized Truth',
              description: 'Community-governed oracle validation with DAO consensus',
              icon: '🌐',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="glass rounded-xl p-6 hover:border-cosmic-cyan/50 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 mb-4">Connect your Aptos wallet to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

