import { getModuleId } from './contracts'

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

export async function mintRealTokens(amount: number = 1000000000000): Promise<string> {
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

  // First register and mint REAL tokens
  const moduleId = getModuleId()
  const functionId = `${moduleId}::real_token::mint_coins`
  
  console.log('Minting REAL tokens:', {
    moduleId,
    functionId,
    amount: amount.toString()
  })
  
  const transaction = {
    type: 'entry_function_payload',
    function: functionId,
    type_arguments: [],
    arguments: [amount.toString()], // 1000 REAL tokens by default (1000 * 10^9)
  }

  try {
    // Use new Petra API format: signAndSubmitTransaction({ payload })
    const response = await wallet.signAndSubmitTransaction({ payload: transaction })
    return response.hash
  } catch (error: any) {
    // Extract all possible error information from PetraApiError
    let errorMsg = error.message || String(error)
    let errorDetails = ''
    
    // Try to get more details from the error object
    if (error.details) {
      errorDetails = error.details
    }
    if (error.code) {
      errorDetails = `Code: ${error.code}. ${errorDetails}`
    }
    if (error.data) {
      errorDetails = `${errorDetails} ${JSON.stringify(error.data)}`
    }
    
    // Combine all error information

    // Try to parse JSON if the message is JSON
    try {
      const parsed = JSON.parse(errorMsg)
      if (parsed.message) errorMsg = parsed.message
      if (parsed.error) errorMsg = parsed.error
      if (parsed.details) errorDetails = parsed.details
    } catch (e) {
      // Not JSON, continue with string
    }
    
    // Check for specific errors
    const combinedMsg = (errorMsg + ' ' + errorDetails).toLowerCase()
    
    // Check for simulation error FIRST (happens before user approval)
    if (combinedMsg.includes('simulation error')) {
      // Try to extract the actual error message from simulation
      const simMatch = errorMsg.match(/Simulation error[:\s]+([^\n]+)/i) || 
                      errorMsg.match(/simulation error[:\s]*([^\n]+)/i) ||
                      errorDetails.match(/simulation error[:\s]+([^\n]+)/i)
      
      if (simMatch && simMatch[1] && !simMatch[1].toLowerCase().includes('generic')) {
        throw new Error(`Transaction simulation failed: ${simMatch[1]}`)
      }
      
      if (combinedMsg.includes('generic error')) {
        console.error('Full error object:', error)
        console.error('Error stack:', error.stack)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        console.error('Error data:', error.data)
        
        // Most likely cause: contract not redeployed
        throw new Error(`🚨 CRITICAL: Contract needs to be redeployed!\n\nThe deployed contract at ${getModuleId()} does not have the fixed code.\n\nPlease run:\n  .\\scripts\\deploy-contract.ps1\n\nThis will deploy the updated contract that fixes the "capabilities" error.`)
      }
    }
    
    // Check for capabilities error - contract needs to be redeployed
    if (combinedMsg.includes('no capabilities') || 
        combinedMsg.includes('capabilities') || 
        combinedMsg.includes('eno_capabilities') ||
        combinedMsg.includes('burn/mint')) {
      throw new Error('Contract needs to be redeployed with the latest fix. Please run: .\scripts\deploy-contract.ps1')
    }
    
    // Check for user rejection (code 4001) - this happens if user rejects the transaction
    if (error.code === 4001 || errorMsg.includes('4001') || errorDetails.includes('4001')) {
      throw new Error('Transaction rejected by user. Please approve the transaction in your wallet to mint REAL tokens.')
    }
    
    if (combinedMsg.includes('network') || combinedMsg.includes('chain')) {
      throw new Error('Wallet network mismatch. Please ensure your wallet is on Devnet.')
    }
    
    // If we have detailed error info, use it
    if (errorDetails && !errorDetails.includes('PetraApiError')) {
      throw new Error(`Minting failed: ${errorDetails}`)
    }
    
    throw new Error(`Minting failed: ${errorMsg}`)
  }
}

export async function checkRealBalance(address: string): Promise<number> {
  // Ensure Buffer is available before using Aptos SDK
  if (typeof window !== 'undefined' && !(window as any).Buffer) {
    const { Buffer } = await import('buffer')
    ;(window as any).Buffer = Buffer
    if (!(window as any).global) {
      ;(window as any).global = window
    }
  }

  // Query coin store for REAL token balance
  try {
    const { Aptos, AptosConfig, Network } = await import('@aptos-labs/ts-sdk')
    const config = new AptosConfig({ network: Network.DEVNET })
    const aptos = new Aptos(config)
    
    const coinType = `${getModuleId()}::real_token::REAL`
    const coinStore = await aptos.getAccountCoinAmount({
      accountAddress: address,
      coinType: coinType as any
    })
    
    return Number(coinStore)
  } catch (error: any) {
    // Coin not registered or doesn't exist
    if (error.message?.includes('could not find a stored value') || 
        error.message?.includes('AccountResourceNotFound') ||
        error.message?.includes('not found')) {
      return 0
    }
    // Buffer error - try to handle gracefully
    if (error.message?.includes('Buffer is not defined')) {
      console.warn('Buffer not available, balance check may fail')
      return 0
    }
    console.error('Error checking REAL balance:', error)
    return 0
  }
}
