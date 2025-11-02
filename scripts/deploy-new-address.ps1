# Deploy RealityNet Contract to Devnet with NEW address
# Use this script if you're getting "Generic error" or "MintStore not found"
# This will generate a new profile and deploy to a fresh address

Write-Host "🚀 Deploying RealityNet Contract to Aptos Devnet (NEW ADDRESS)" -ForegroundColor Cyan
Write-Host ""

# Navigate to Move directory
Set-Location aptos

# Generate a new profile for fresh deployment
Write-Host "📝 Generating new profile for deployment..." -ForegroundColor Yellow
$PROFILE_NAME = "realitynet_new_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
aptos init --profile $PROFILE_NAME --network devnet --assume-yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Profile generation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Get the account address from the new profile
$NEW_ADDRESS = (aptos config show-profiles --profile $PROFILE_NAME --json | ConvertFrom-Json).profiles.$PROFILE_NAME.account

Write-Host "✅ New profile created: $PROFILE_NAME" -ForegroundColor Green
Write-Host "📍 New Module Address: $NEW_ADDRESS" -ForegroundColor Cyan
Write-Host ""

# Update Move.toml with new address
Write-Host "🔧 Updating Move.toml with new address..." -ForegroundColor Yellow
$moveToml = Get-Content Move.toml -Raw
$moveToml = $moveToml -replace 'realitynet = "0x[^"]+"', "realitynet = `"$NEW_ADDRESS`""
Set-Content Move.toml $moveToml

# Compile Move modules
Write-Host "🔨 Compiling Move modules..." -ForegroundColor Yellow
aptos move compile --named-addresses realitynet=$NEW_ADDRESS

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
  --named-addresses realitynet=$NEW_ADDRESS `
  --profile $PROFILE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Update .env file
Set-Location ..
$envContent = "VITE_MODULE_ADDRESS=$NEW_ADDRESS"
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📍 New Module Address: $NEW_ADDRESS" -ForegroundColor Cyan
Write-Host "📝 Profile Name: $PROFILE_NAME" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update your .env file with:" -ForegroundColor Yellow
Write-Host "   VITE_MODULE_ADDRESS=$NEW_ADDRESS" -ForegroundColor White
Write-Host ""
Write-Host "You can now mint REAL tokens using the 'Get REAL Tokens' button in the app." -ForegroundColor Green

