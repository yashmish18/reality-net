#!/bin/bash

# Register REAL token for your account
MODULE_ADDRESS="0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705"

echo "Registering REAL token..."

cd aptos

# This will register and mint in one transaction
aptos move run \
  --function-id "${MODULE_ADDRESS}::real_token::mint_coins" \
  --args u64:1000000000000 \
  --profile default

echo "✅ Registered and minted 1000 REAL tokens!"

