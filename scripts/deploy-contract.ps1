# Deploy RealityNet Contract to Devnet
# IMPORTANT: If you get "Generic error" or "MintStore not found", you need a NEW address
# The coin was already initialized at the old address, so MintStore can't be created there
# Generate a new address by creating a new profile or using a different account

$MODULE_ADDRESS = "0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705"

Write-Host "🚀 Deploying RealityNet Contract to Aptos Devnet" -ForegroundColor Cyan
Write-Host "📍 Module Address: $MODULE_ADDRESS" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  NOTE: If minting fails after deployment, you may need a NEW module address" -ForegroundColor Red
Write-Host "   (The coin was already initialized, so MintStore might not exist)" -ForegroundColor Red
Write-Host ""

# Navigate to Move directory
Set-Location aptos

# Compile Move modules
Write-Host "🔨 Compiling Move modules..." -ForegroundColor Yellow
aptos move compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Publish modules
Write-Host ""
Write-Host "📦 Publishing modules to devnet..." -ForegroundColor Yellow
Write-Host "This will require you to approve the transaction in your wallet." -ForegroundColor Gray

aptos move publish `
  --named-addresses realitynet=$MODULE_ADDRESS `
  --profile default

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Get module address
Write-Host ""
Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
Write-Host "Module Address: $MODULE_ADDRESS" -ForegroundColor Cyan

# Update .env file
Set-Location ..
$envContent = "VITE_MODULE_ADDRESS=$MODULE_ADDRESS"
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "You can now mint REAL tokens using the 'Get REAL Tokens' button in the app." -ForegroundColor Yellow

