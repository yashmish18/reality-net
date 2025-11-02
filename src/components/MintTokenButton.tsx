import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { mintRealTokens } from '../services/realToken'

export default function MintTokenButton({ onSuccess }: { onSuccess?: () => void }) {
  const { connected, address } = useWallet()
  const [minting, setMinting] = useState(false)

  const handleMint = async () => {
    if (!connected || !address) {
      alert('Please connect your wallet first')
      return
    }

    setMinting(true)
    try {
      const txHash = await mintRealTokens(1000000000000) // 1000 REAL tokens
      alert(`✅ REAL tokens minted successfully!\nTransaction: ${txHash}`)
      onSuccess?.()
    } catch (error: any) {
      console.error('Minting error:', error)
      const errorMsg = error.message || String(error)
      
      // Show helpful error messages
      if (errorMsg.includes('redeploy') || errorMsg.includes('capabilities')) {
        alert(`⚠️ Contract needs to be updated!\n\n${errorMsg}\n\nPlease run the deployment script:\n.\scripts\deploy-contract.ps1`)
      } else {
        alert(`Failed to mint REAL tokens: ${errorMsg}`)
      }
    } finally {
      setMinting(false)
    }
  }

  return (
    <motion.button
      onClick={handleMint}
      disabled={minting || !connected}
      whileHover={connected ? { scale: 1.02 } : {}}
      whileTap={connected ? { scale: 0.98 } : {}}
      className={`px-4 py-2 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-lg font-semibold text-sm disabled:opacity-50 ${
        !connected ? 'cursor-not-allowed' : ''
      }`}
    >
      {minting ? 'Minting...' : 'Get REAL Tokens'}
    </motion.button>
  )
}

