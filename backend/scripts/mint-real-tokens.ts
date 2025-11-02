import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey, U64 } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.DEVNET })
const aptos = new Aptos(config)

const MODULE_ADDRESS = '0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705'

async function mintRealTokens(walletAddress: string, amount: number) {
  try {
    // Note: This requires the wallet's private key
    // For production, use wallet extension integration
    
    console.log(`Minting ${amount} REAL tokens to ${walletAddress}`)
    
    const transaction = await aptos.transaction.build.simple({
      sender: walletAddress as any,
      data: {
        function: `${MODULE_ADDRESS}::real_token::mint_coins`,
        typeArguments: [],
        functionArguments: [U64(amount)]
      }
    })

    console.log('Transaction prepared. Sign and submit with wallet.')
    return transaction
  } catch (error: any) {
    console.error('Error:', error.message)
    throw error
  }
}

// For CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const walletAddress = process.argv[2]
  const amount = process.argv[3] ? parseInt(process.argv[3]) : 1000000000000 // 1000 REAL tokens
  
  if (!walletAddress) {
    console.log('Usage: tsx scripts/mint-real-tokens.ts <wallet_address> [amount]')
    process.exit(1)
  }
  
  mintRealTokens(walletAddress, amount)
    .then(() => console.log('✅ Transaction ready'))
    .catch(console.error)
}

