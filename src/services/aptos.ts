import { Aptos, Account } from '@aptos-labs/ts-sdk'
import { getModuleId } from './contracts'

export async function mintRealityNFT(
  mediaHash: string,
  ipfsCID: string,
  latitude: number,
  longitude: number,
  eventType: string,
  description: string,
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window not available')
  }

  const wallet = (window as any).aptos || (window as any).martian
  if (!wallet) {
    throw new Error('Wallet not connected')
  }

  // Ensure wallet is on devnet before transaction
  try {
    await ensureDevnetNetwork(wallet)
  } catch (error) {
    console.warn('Network check failed, continuing:', error)
  }

  const transaction = {
    type: 'entry_function_payload',
    function: `${getModuleId()}::reality_nft::mint_reality_nft`,
    type_arguments: [],
    arguments: [
      Array.from(new TextEncoder().encode(mediaHash)),
      Array.from(new TextEncoder().encode(ipfsCID)),
      Math.floor(latitude * 1e6).toString(),
      Math.floor(longitude * 1e6).toString(),
      Array.from(new TextEncoder().encode(eventType)),
      Array.from(new TextEncoder().encode(description)),
    ],
  }

  try {
    // Use new Petra API format: signAndSubmitTransaction({ payload })
    const response = await wallet.signAndSubmitTransaction({ payload: transaction })
    return response.hash
  } catch (error: any) {
    const errorMsg = error.message || String(error)
    if (errorMsg.includes('network') || errorMsg.includes('chain')) {
      throw new Error('Wallet network mismatch. Please ensure your wallet is on Devnet.')
    }
    throw error
  }
}

export async function stakeForVerification(
  accountAddress: string,
  amount: number,
  tokenId: string,
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window not available')
  }

  const wallet = (window as any).aptos || (window as any).martian
  if (!wallet) {
    throw new Error('Wallet not connected')
  }

  // Ensure wallet is on devnet before transaction
  try {
    await ensureDevnetNetwork(wallet)
  } catch (error) {
    console.warn('Network check failed, continuing:', error)
  }

  // First, ensure coin is registered by checking balance
  // If balance check fails, try to register and mint
  try {
    const { checkRealBalance } = await import('./realToken')
    const balance = await checkRealBalance(accountAddress)
    
    if (balance === 0 || balance < amount) {
      throw new Error(`Insufficient REAL tokens. You have ${(balance / 1e9).toFixed(2)} REAL, need ${(amount / 1e9).toFixed(2)} REAL. Please mint REAL tokens first.`)
    }
  } catch (error: any) {
    const errorMsg = error.message || String(error)
    // If it's a balance error, throw it
    if (errorMsg.includes('Insufficient REAL tokens') || errorMsg.includes('REAL tokens')) {
      throw error
    }
    // If coin store doesn't exist, suggest minting
    if (errorMsg.includes('could not find') || errorMsg.includes('not found') || errorMsg.includes('AccountResourceNotFound')) {
      throw new Error('REAL token not registered on your account. Please mint REAL tokens first using the "Get REAL Tokens" button.')
    }
    // Otherwise, log and continue - might just be a temporary error
    console.warn('Balance check failed, continuing with staking:', error)
  }

  const transaction = {
    type: 'entry_function_payload',
    function: `${getModuleId()}::staking::stake_for_verification`,
    type_arguments: [],
    arguments: [amount.toString(), tokenId],
  }

  try {
    // Use new Petra API format: signAndSubmitTransaction({ payload })
    const response = await wallet.signAndSubmitTransaction({ payload: transaction })
    return response.hash
  } catch (error: any) {
    const errorMsg = error.message || String(error) || JSON.stringify(error)
    
    // Provide better error messages for common issues
    if (errorMsg.includes('Insufficient balance') || 
        errorMsg.includes('EINSUFFICIENT_BALANCE') ||
        errorMsg.includes('INSUFFICIENT_BALANCE')) {
      throw new Error('Insufficient REAL token balance. Please mint REAL tokens first using the "Get REAL Tokens" button.')
    }
    
    if (errorMsg.includes('could not find') || 
        errorMsg.includes('AccountResourceNotFound') ||
        errorMsg.includes('not registered')) {
      throw new Error('REAL token not registered on your account. Please mint REAL tokens first using the "Get REAL Tokens" button.')
    }
    
    if (errorMsg.includes('network') || errorMsg.includes('chain')) {
      throw new Error('Wallet network mismatch. Please ensure your wallet is on Devnet.')
    }
    
    // If it's a simulation error, extract the actual error message
    if (errorMsg.includes('Simulation error')) {
      const match = errorMsg.match(/Simulation error[\s\S]*?(Insufficient balance[^"]*)/i)
      if (match) {
        throw new Error('Insufficient REAL token balance. Please mint REAL tokens first using the "Get REAL Tokens" button.')
      }
    }
    
    throw new Error(`Failed to stake: ${errorMsg}`)
  }
}

const ensureDevnetNetwork = async (wallet: any) => {
  try {
    // Check current network
    let currentNetwork: string | null = null
    if (typeof wallet.network === 'function') {
      currentNetwork = await wallet.network()
    } else if (typeof wallet.chainId === 'function') {
      const chainId = await wallet.chainId()
      // Devnet chainId is 34
      if (chainId === 34) {
        currentNetwork = 'devnet'
      } else if (chainId === 1) {
        currentNetwork = 'mainnet'
      } else {
        currentNetwork = 'testnet'
      }
    }

    // Switch to devnet if not already on it
    if (currentNetwork && currentNetwork.toLowerCase() !== 'devnet') {
      console.log(`Current network: ${currentNetwork}, attempting to switch to devnet...`)
      
      if (typeof wallet.changeNetwork === 'function') {
        await wallet.changeNetwork('devnet')
      } else if (typeof wallet.setNetwork === 'function') {
        await wallet.setNetwork('devnet')
      } else {
        console.warn('Wallet does not support programmatic network switching. Please switch to Devnet manually in your wallet.')
      }
      
      // Wait a bit for network switch
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.warn('Could not check/switch network:', error)
    // Continue anyway - network might be fine
  }
}

export async function createDAOProposal(
  title: string,
  description: string,
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window not available')
  }

  const wallet = (window as any).aptos || (window as any).martian
  if (!wallet) {
    throw new Error('Wallet not connected')
  }

  // Ensure wallet is on devnet before transaction
  try {
    await ensureDevnetNetwork(wallet)
  } catch (error) {
    console.warn('Network check failed, continuing:', error)
  }

  const transaction = {
    type: 'entry_function_payload',
    function: `${getModuleId()}::dao::create_proposal`,
    type_arguments: [],
    arguments: [
      Array.from(new TextEncoder().encode(title)),
      Array.from(new TextEncoder().encode(description)),
    ],
  }

  try {
    // Use new Petra API format: signAndSubmitTransaction({ payload })
    const response = await wallet.signAndSubmitTransaction({ payload: transaction })
    return response.hash
  } catch (error: any) {
    const errorMsg = error.message || String(error)
    if (errorMsg.includes('network') || errorMsg.includes('chain')) {
      throw new Error('Wallet network mismatch. Please ensure your wallet is on Devnet.')
    }
    throw error
  }
}



