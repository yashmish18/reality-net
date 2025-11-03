# RealityNet — Blockchain-Backed Proof-of-Reality dApp
<img width="1080" height="1461" alt="image" src="https://github.com/user-attachments/assets/c26ec125-10db-4708-9c86-5e4acb8e418b" />
<img width="1011" height="1600" alt="image" src="https://github.com/user-attachments/assets/14c5eb8b-3976-44f3-ac47-de5beb9f71b7" />




**Aptos Devnet Contract Address: `0x3df1b91e01acffa234d7824f03937bf98fc5cc254d580ac6290796ac5a2b7705`**
<img width="1699" height="901" alt="image" src="https://github.com/user-attachments/assets/bcd9611a-a57b-49dd-b088-ea5719b15f35" />
<img width="1809" height="893" alt="image" src="https://github.com/user-attachments/assets/d76cad24-b8ef-461c-80d9-47d965ac1267" />
<img width="1731" height="949" alt="image" src="https://github.com/user-attachments/assets/a9151904-901f-4eff-b2f1-0b672a5e027b" />
<img width="1440" height="1079" alt="image" src="https://github.com/user-attachments/assets/07c3cdbf-9f99-45e2-a388-93b8734105f8" />




Instagram-like social platform where users stake REAL tokens on whether news/events are correct or incorrect.

# RealityNet

Aptos Devnet Contract Address: `0xe23271845ae90b84415dc51d813ce44ec5ce3665120869416bfef1b425dd0317`

RealityNet is a decentralized application (dApp) that functions as an Instagram-like social platform. It allows users to engage with news and events by staking 'REAL' tokens to verify or challenge the authenticity of information. The platform aims to create a blockchain-backed proof-of-reality system where community consensus, driven by token staking, determines the veracity of shared content.

## How it Works:

1.  **Content Sharing:** Users can upload and share real-world events and news, similar to a social media feed.
2.  **Staking for Verification:** Other users can stake 'REAL' tokens on these posts to indicate whether they believe the information is 'correct' or 'incorrect'. This staking mechanism acts as a vote of confidence or skepticism.
3.  **Consensus and Reality:** The collective staking actions of the community contribute to a decentralized consensus on the authenticity of the shared reality. Posts with a higher stake on 'correct' are considered more verified, while those with significant 'incorrect' stakes are challenged.
4.  **Tokenomics:** 'REAL' tokens are central to the ecosystem, used for staking, and potentially for rewards or governance within the platform.
5.  **Transparency:** All staking actions and content verification processes are recorded on the Aptos blockchain, ensuring transparency and immutability.

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
