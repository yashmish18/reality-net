import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { stakeForVerification } from '../services/aptos'
import { checkRealBalance } from '../services/realToken'
import MintTokenButton from './MintTokenButton'

interface VerificationCardProps {
  tokenId: string
  description: string
  verified: boolean
  verifierCount: number
  challengeCount: number
}

export default function VerificationCard({
  tokenId,
  description,
  verified,
  verifierCount,
  challengeCount,
}: VerificationCardProps) {
  const { address, connected, aptos } = useWallet()
  const [realBalance, setRealBalance] = useState<number | null>(null)
  const [checkingBalance, setCheckingBalance] = useState(false)

  const checkBalance = async () => {
    if (!address) return
    setCheckingBalance(true)
    try {
      const balance = await checkRealBalance(address)
      setRealBalance(balance)
    } catch (error) {
      console.error('Error checking balance:', error)
      setRealBalance(0)
    } finally {
      setCheckingBalance(false)
    }
  }

  // Check balance when component mounts or address changes
  useEffect(() => {
    if (connected && address) {
      checkBalance()
    }
  }, [connected, address])

  const handleStake = async (isVerification: boolean) => {
    if (!connected || !address) {
      alert('Please connect your wallet')
      return
    }

    try {
      const stakeAmount = 1000000000 // 1 REAL token
      
      // Check balance first
      const balance = await checkRealBalance(address)
      if (balance < stakeAmount) {
        alert(`Insufficient REAL tokens. You have ${(balance / 1e9).toFixed(2)} REAL, need ${(stakeAmount / 1e9).toFixed(2)} REAL.\n\nPlease mint REAL tokens first using the "Get REAL Tokens" button above.`)
        return
      }

      await stakeForVerification(aptos, address!, stakeAmount, tokenId)
      alert(`${isVerification ? 'Verification' : 'Challenge'} staked successfully!`)
      // Refresh balance after staking
      await checkBalance()
    } catch (error: any) {
      console.error('Staking error:', error)
      const errorMsg = error.message || String(error)
      
      // Show the actual error message which should be helpful
      if (errorMsg.includes('Insufficient') || errorMsg.includes('REAL tokens') || errorMsg.includes('mint')) {
        alert(errorMsg)
      } else {
        alert(`Failed to stake: ${errorMsg}`)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 hover:border-cosmic-cyan/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{description}</h3>
          <p className="text-sm text-gray-400 font-mono mb-2">ID: {tokenId.slice(0, 16)}...</p>
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">✓ Verifications: {verifierCount}</span>
            <span className="text-red-400">✗ Challenges: {challengeCount}</span>
          </div>
        </div>
        {verified && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs">
            Verified
          </span>
        )}
      </div>

      {connected && (
        <div className="mt-4">
          {realBalance !== null && realBalance < 1000000000 && (
            <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 mb-2">
                You need REAL tokens to stake. Current balance: {(realBalance / 1e9).toFixed(2)} REAL
              </p>
              <MintTokenButton onSuccess={checkBalance} />
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleStake(true)}
              disabled={checkingBalance}
              className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-semibold disabled:opacity-50"
            >
              Verify (Stake 1 REAL)
            </button>
            <button
              onClick={() => handleStake(false)}
              disabled={checkingBalance}
              className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-semibold disabled:opacity-50"
            >
              Challenge (Stake 1 REAL)
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

