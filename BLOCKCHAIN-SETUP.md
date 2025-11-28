# Blockchain Integration Guide

## Overview

This platform supports blockchain integration for transparent hackathon management. Currently in **Development Mode** using test networks.

---

## 🌐 Supported Test Networks

### 1. **Ethereum Sepolia Testnet** (Recommended)
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### 2. **Polygon Mumbai Testnet**
- **RPC URL**: `https://rpc-mumbai.maticvigil.com`
- **Chain ID**: 80001
- **Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

### 3. **Base Sepolia Testnet** (Fast & Cheap)
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: 84532
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

---

## 💰 Getting Test Tokens (Faucets)

### Sepolia ETH Faucets:
1. **Alchemy Faucet**: https://sepoliafaucet.com
   - Requires Alchemy account (free)
   - Get 0.5 SepoliaETH per day
   
2. **Infura Faucet**: https://www.infura.io/faucet/sepolia
   - Free, no account needed
   - Get 0.5 SepoliaETH

3. **Chainlink Faucet**: https://faucets.chain.link/sepolia
   - Free, connects with wallet
   - Get 0.1 SepoliaETH + 10 LINK tokens

### Polygon Mumbai MATIC Faucets:
1. **Official Polygon Faucet**: https://faucet.polygon.technology
   - Get 0.5 MATIC per day
   - Supports multiple testnets

2. **Alchemy Mumbai Faucet**: https://mumbaifaucet.com
   - Free, requires Alchemy account

### Base Sepolia ETH Faucets:
1. **Coinbase Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Get 0.1 ETH on Base Sepolia
   - No wallet connection required

---

## 🔧 Setup for Development

### Step 1: Get an RPC Provider (Free)

#### Option A: Infura
1. Go to https://infura.io
2. Sign up for free account
3. Create a new project
4. Copy the Sepolia RPC URL

#### Option B: Alchemy
1. Go to https://alchemy.com
2. Sign up for free account
3. Create a new app (Ethereum → Sepolia)
4. Copy the HTTPS URL

#### Option C: Public RPC (No signup)
- Polygon Mumbai: `https://rpc-mumbai.maticvigil.com`
- Base Sepolia: `https://sepolia.base.org`

### Step 2: Configure Environment

Update `.env`:
```env
# Use Sepolia Testnet
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BLOCKCHAIN_CHAIN_ID=11155111

# Or Polygon Mumbai
# BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
# BLOCKCHAIN_CHAIN_ID=80001

# Private key for contract deployment (DO NOT commit!)
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_here
```

### Step 3: Fund Your Deployer Wallet

1. Get test ETH from faucet (see above)
2. Use the wallet address that matches your `DEPLOYER_PRIVATE_KEY`
3. Verify balance on explorer

### Step 4: Deploy Smart Contracts

```bash
# Install dependencies
npm install

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Mumbai
npx hardhat run scripts/deploy.js --network mumbai
```

### Step 5: Update Backend Configuration

Copy the deployed contract address to `.env`:
```env
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

---

## 🚀 Production Setup (Railway)

### Recommended: Use Managed RPC Providers

**DO NOT run blockchain nodes on Railway!** Use these providers instead:

#### 1. **Alchemy** (Best for Production)
- Free tier: 300M compute units/month
- Dashboard: https://dashboard.alchemy.com
- Pricing: $49/month for growth plan

#### 2. **Infura**
- Free tier: 100K requests/day
- Dashboard: https://infura.io/dashboard
- Pricing: $50/month for developer plan

#### 3. **QuickNode**
- Dedicated nodes
- Multiple chains supported
- Starting at $9/month

### Railway Environment Variables

In your Railway project settings:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3001

# Blockchain
BLOCKCHAIN_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x...
BLOCKCHAIN_CHAIN_ID=1

# Optional: Multi-chain support
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
```

---

## 📝 Network Configuration Files

### For Development (Testnet)

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 11155111
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 80001
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 84532
    }
  }
};
```

---

## 🔐 Security Best Practices

### Never Commit Private Keys!
```bash
# Add to .gitignore
.env
.env.local
.env.production
hardhat.config.js
```

### Use Environment Variables
- Development: `.env.local`
- Production: Railway dashboard → Variables

### Wallet Security
- **Development**: Use test wallets only
- **Production**: Use hardware wallets or key management services
- **Never reuse**: Production wallets for testing

---

## 📊 Monitoring & Debugging

### Check Transaction Status
1. Copy transaction hash from logs
2. Paste in appropriate explorer:
   - Sepolia: https://sepolia.etherscan.io
   - Mumbai: https://mumbai.polygonscan.com

### Common Issues

**"Insufficient funds"**
- Get more test ETH from faucet
- Check wallet balance on explorer

**"Network not found"**
- Verify RPC URL is correct
- Check internet connection
- Try alternative RPC provider

**"Gas estimation failed"**
- Increase gas limit in hardhat config
- Check contract function parameters

---

## 🎯 Recommended Flow

### For Hackathon Demo:
1. Use **Polygon Mumbai** (fast, cheap, reliable)
2. Get MATIC from faucet
3. Deploy contracts
4. Show transparent scoring on-chain

### For Beta Testing:
1. Use **Base Sepolia** (very fast, Ethereum-compatible)
2. Lower gas fees than Ethereum
3. Good for user testing

### For Production:
1. Use **Ethereum Mainnet** with Alchemy
2. Or **Polygon Mainnet** for lower fees
3. Implement proper key management

---

## 🆘 Support Resources

- **Ethereum Docs**: https://ethereum.org/developers
- **Hardhat Docs**: https://hardhat.org/docs
- **Alchemy University**: https://university.alchemy.com
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com

---

## 📋 Checklist

- [ ] Get RPC provider (Infura/Alchemy)
- [ ] Create test wallet
- [ ] Get test tokens from faucet
- [ ] Configure `.env` with RPC URL
- [ ] Deploy smart contracts to testnet
- [ ] Update `CONTRACT_ADDRESS` in `.env`
- [ ] Test contract interactions
- [ ] Monitor on block explorer
- [ ] Set up Railway environment variables
- [ ] Deploy backend to Railway
