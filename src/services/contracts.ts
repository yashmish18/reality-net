export function getModuleId(): string {
  // Deployed module address on Aptos Devnet
  return import.meta.env.VITE_MODULE_ADDRESS || '0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705'
}

export const REAL_TOKEN_MODULE = `${getModuleId()}::real_token`
export const REALITY_NFT_MODULE = `${getModuleId()}::reality_nft`
export const STAKING_MODULE = `${getModuleId()}::staking`
export const DAO_MODULE = `${getModuleId()}::dao`
export const ORACLE_MODULE = `${getModuleId()}::oracle`

