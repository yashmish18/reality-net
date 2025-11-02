#!/bin/bash

echo "🔧 Setting up RealityNet development environment"

# Install Node.js dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install Aptos CLI if not present
if ! command -v aptos &> /dev/null; then
    echo "📥 Installing Aptos CLI..."
    curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
fi

# Setup Aptos for Move development
cd aptos
if [ ! -f .aptos/config.yaml ]; then
    echo "🔐 Setting up Aptos account..."
    aptos init --network devnet
fi

# Initialize Move project
if [ ! -f Move.toml ]; then
    echo "⚠️  Move.toml already exists"
else
    echo "✅ Move project initialized"
fi

cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    echo "VITE_MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS" > .env
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update VITE_MODULE_ADDRESS in .env after deploying contracts"
echo "2. Run 'npm run dev' to start the frontend"
echo "3. Run './deploy.sh' to deploy smart contracts"

