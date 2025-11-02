import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

const config = new AptosConfig({ network: Network.DEVNET })
export const aptos = new Aptos(config)

export async function stakeForVerification(
  accountAddress: string,
  amount: number,
  tokenId: string
): Promise<string> {
  // This would integrate with wallet to sign transactions
  // For now, return a mock tx hash - actual implementation needs wallet integration
  return `0x${Math.random().toString(16).substring(2)}`
}

