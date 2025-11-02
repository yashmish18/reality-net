#!/bin/bash

echo "🚀 Deploying RealityNet to Aptos Devnet"

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Installing..."
    curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
fi

# Navigate to Move directory
cd aptos

# Initialize Aptos account if not exists
if [ ! -f .aptos/config.yaml ]; then
    echo "📝 Initializing Aptos account..."
    aptos init --network devnet
fi

# Compile Move modules
echo "🔨 Compiling Move modules..."
aptos move compile

# Publish modules
echo "📦 Publishing modules to devnet..."
aptos move publish --named-addresses realitynet=default

# Get module address
MODULE_ADDRESS=$(aptos account list --query-only | grep "default" | awk '{print $1}')
echo "✅ Module deployed at: $MODULE_ADDRESS"

# Create .env file for frontend
cd ..
echo "VITE_MODULE_ADDRESS=$MODULE_ADDRESS" > .env

echo "✅ Deployment complete! Update VITE_MODULE_ADDRESS in .env with: $MODULE_ADDRESS"

