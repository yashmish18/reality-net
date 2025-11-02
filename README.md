# RealityNet — Blockchain-Backed Proof-of-Reality dApp

**Aptos Devnet Contract Address: `0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705`**

Instagram-like social platform where users stake REAL tokens on whether news/events are correct or incorrect.

## Quick Start

### 1. Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 2. Setup Database
```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

### 3. Deploy Smart Contracts (if not already deployed)
```bash
# Ensure you have the Aptos CLI installed and configured for Devnet
cd aptos
aptos move compile --named-addresses realitynet=0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705
aptos move publish --named-addresses realitynet=0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705 --profile default
cd ..
```

### 4. Start Backend
```bash
cd backend
npm run dev
```

### 5. Start Frontend (in new terminal)
```bash
npm run dev
```

### 6. Mint REAL Tokens (For Staking)
```powershell
# Windows PowerShell
.\scripts\mint-real.ps1

# Or manually (ensure your wallet is connected to Devnet and has APT for gas):
cd aptos
aptos move run --function-id "0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705::real_token::mint_coins" --args u64:1000000000000 --profile default
```

## Important: REAL Tokens Required for Staking

**You need REAL tokens to stake, not APT tokens!**
- APT = Gas fees only
- REAL = Staking currency

Mint REAL tokens using the script above or the "Get REAL Tokens" button in the app.

## Features

✅ Instagram-like feed with posts, likes, comments  
✅ Stake on truth (correct/incorrect) with REAL tokens  
✅ Follow users and see their posts  
✅ Real-time notifications  
✅ AI authenticity scoring  
✅ 3D Reality Ledger timeline  
✅ DAO governance  

## Project Structure

- `src/` - React frontend
- `backend/` - Express API server
- `aptos/` - Move smart contracts
- `scripts/` - Helper scripts

## API Endpoints

- `http://localhost:4000/api/feed` - Get posts feed
- `http://localhost:4000/api/posts` - Create/view posts
- `http://localhost:4000/api/stakes` - Stake on posts
- `http://localhost:4000/api/users` - User profiles, follows, likes

## Troubleshooting

### "Insufficient balance" when staking
→ You need REAL tokens! Run `.\scripts\mint-real.ps1` or use the "Get REAL Tokens" button.

### Database errors
→ Run `cd backend && npx prisma migrate dev`

### Frontend not connecting
→ Make sure backend is running on port 4000