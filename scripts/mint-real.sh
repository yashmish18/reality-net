#!/bin/bash

# Mint REAL tokens script
MODULE_ADDRESS="0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705"
WALLET_ADDRESS="${1:-0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705}"
AMOUNT="${2:-1000000000000}"  # 1000 REAL tokens (9 decimals)

echo "Minting REAL tokens..."
echo "Wallet: $WALLET_ADDRESS"
echo "Amount: $AMOUNT (1000 REAL)"

cd aptos

aptos move run \
  --function-id "${MODULE_ADDRESS}::real_token::mint_coins" \
  --args u64:"${AMOUNT}" \
  --profile default

echo "✅ Minting complete!"

