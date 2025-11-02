# Mint REAL Tokens Script for Windows
$MODULE_ADDRESS = "0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705"
$AMOUNT = "1000000000000"  # 1000 REAL tokens

Write-Host "Minting REAL tokens..." -ForegroundColor Cyan
Write-Host "Amount: 1000 REAL tokens" -ForegroundColor Yellow
Write-Host "Module: ${MODULE_ADDRESS}::real_token::mint_coins" -ForegroundColor Gray

cd aptos

# First re-deploy the contracts with entry function
Write-Host "`nRe-deploying contracts with entry function..." -ForegroundColor Yellow
aptos move publish --named-addresses realitynet=$MODULE_ADDRESS --assume-yes

Write-Host "`nMinting tokens..." -ForegroundColor Cyan
aptos move run `
  --function-id "${MODULE_ADDRESS}::real_token::mint_coins" `
  --args "u64:${AMOUNT}" `
  --profile default `
  --assume-yes

Write-Host "`n✅ Minting complete! You now have 1000 REAL tokens to stake with." -ForegroundColor Green

