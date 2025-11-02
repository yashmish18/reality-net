import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

interface WalletContextType {
  address: string | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  aptos: Aptos
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  
  const config = new AptosConfig({ network: Network.DEVNET })
  const aptos = new Aptos(config)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined') {
      const wallet = (window as any).aptos || (window as any).martian
      if (wallet) {
        try {
          // Ensure devnet network
          await ensureDevnetNetwork(wallet)
          
          const account = await wallet.account()
          if (account && account.address) {
            setAddress(account.address)
            setConnected(true)
          }
        } catch (e) {
          console.log('Wallet not connected')
        }
      }
    }
  }

  const connect = async () => {
    if (typeof window !== 'undefined') {
      const wallet = (window as any).aptos || (window as any).martian
      if (wallet) {
        try {
          // Check and switch network to devnet if needed
          await ensureDevnetNetwork(wallet)
          
          const response = await wallet.connect()
          const account = await wallet.account()
          if (account && account.address) {
            setAddress(account.address)
            setConnected(true)
          } else if (response && response.address) {
            setAddress(response.address)
            setConnected(true)
          }
        } catch (error: any) {
          console.error('Failed to connect wallet:', error)
          if (error.code === 4001) {
            alert('Connection rejected by user')
          } else {
            alert(`Failed to connect wallet: ${error.message || error}`)
          }
        }
      } else {
        alert('Please install Petra or Martian wallet extension')
        window.open('https://petra.app/', '_blank')
      }
    }
  }

  const ensureDevnetNetwork = async (wallet: any) => {
    try {
      // Check current network
      let currentNetwork: string | null = null
      if (wallet.network) {
        currentNetwork = await wallet.network()
      } else if (wallet.chainId) {
        // Some wallets use chainId - devnet chainId is 34
        const chainId = await wallet.chainId()
        currentNetwork = chainId === 34 ? 'devnet' : chainId === 1 ? 'mainnet' : 'testnet'
      }

      // Switch to devnet if not already on it
      if (currentNetwork && currentNetwork.toLowerCase() !== 'devnet') {
        console.log(`Current network: ${currentNetwork}, switching to devnet...`)
        
        if (wallet.changeNetwork) {
          await wallet.changeNetwork('devnet')
        } else if (wallet.setNetwork) {
          await wallet.setNetwork('devnet')
        } else if (wallet.network) {
          // Try setting network property directly if available
          wallet.network = 'devnet'
        }
        
        // Wait a bit for network switch
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Verify network was switched
        if (wallet.network) {
          const newNetwork = await wallet.network()
          if (newNetwork?.toLowerCase() !== 'devnet') {
            console.warn('Failed to switch network, but continuing...')
          }
        }
      }
    } catch (error) {
      console.warn('Could not check/switch network:', error)
      // Continue anyway - network might be fine
    }
  }

  const disconnect = async () => {
    if (typeof window !== 'undefined') {
      const wallet = (window as any).aptos || (window as any).martian
      if (wallet && wallet.disconnect) {
        try {
          await wallet.disconnect()
        } catch (e) {
          console.log('Error disconnecting:', e)
        }
      }
    }
    setAddress(null)
    setConnected(false)
  }

  return (
    <WalletContext.Provider value={{ address, connected, connect, disconnect, aptos }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

