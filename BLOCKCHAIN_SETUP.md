# Blockchain Integration Guide

## Current Status
- ✅ Smart contracts ready (`contracts/HackathonPlatform.sol`)
- ✅ Blockchain helper functions ready (`lib/blockchain.ts`)
- ❌ NOT integrated into backend (database-only mode)
- ❌ NOT deployed to any network

## Phase 1: Enable Blockchain Integration (LOCAL)

### 1. Update Backend to Use Blockchain

Add to `server/index.ts`:
```typescript
import { 
  createHackathonOnChain, 
  submitProjectOnChain,
  scoreProjectOnChain 
} from '../lib/blockchain.js';
```

### 2. Modify Create Hackathon Endpoint (Example)
```typescript
// After creating in database
const blockchainId = await createHackathonOnChain(
  name, 
  description, 
  Math.floor(new Date(startDate).getTime() / 1000),
  Math.floor(new Date(endDate).getTime() / 1000)
);

// Update database with real blockchain ID
await pool.query(
  'UPDATE hackathons SET blockchain_id = $1 WHERE id = $2',
  [blockchainId, result.rows[0].id]
);
```

## Phase 2: Deploy to Testnet (RECOMMENDED)

### Option A: Ethereum Sepolia Testnet (FREE)

1. **Get Infura/Alchemy API Key**
   - Sign up at https://infura.io or https://alchemy.com
   - Create new project
   - Copy API key

2. **Update `.env`**
```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_here
```

3. **Update `hardhat.config.js`**
```javascript
networks: {
  sepolia: {
    url: process.env.BLOCKCHAIN_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY]
  }
}
```

4. **Deploy Contract**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Update `lib/blockchain.ts`**
```typescript
provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY'
);
```

### Option B: Polygon Mumbai Testnet (FASTER & FREE)

1. **Update `.env`**
```env
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_here
```

2. **Get Test MATIC**
   - Visit https://faucet.polygon.technology/
   - Enter your wallet address
   - Receive test tokens

3. **Deploy**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

## Phase 3: Production Deployment (PAID)

### Railway Environment Variables

Add to Railway project:
```env
BLOCKCHAIN_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0xYourDeployedContractAddress
DEPLOYER_PRIVATE_KEY=your_production_private_key
```

### Cost Estimates
- **Alchemy Free Tier**: 300M compute units/month (sufficient for small apps)
- **Infura Free Tier**: 100k requests/day
- **QuickNode Starter**: $9/month

## Wallet Usage Implementation

### 1. Project Submission
```typescript
// Verify wallet signature before submission
const signature = await signer.signMessage(projectHash);
// Submit to blockchain with proof
const blockchainProjectId = await submitProjectOnChain(...);
```

### 2. Score Submission
```typescript
// Judge signs score with their wallet
const scoreHash = ethers.utils.solidityKeccak256(
  ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
  [projectId, technical, innovation, presentation, impact]
);
await scoreProjectOnChain(hackathonId, projectId, ...);
```

### 3. Prize Distribution (Future)
```typescript
// Smart contract automatically transfers prizes
await contract.distributePrizes(hackathonId);
```

## Why NOT Run Blockchain on Railway?

❌ **Impossible/Impractical:**
1. Blockchain nodes need 100+ GB storage (Railway: ephemeral)
2. Nodes need 24/7 uptime (Railway: restarts containers)
3. Syncing takes hours/days (Railway: times out)
4. Expensive: $100+/month for adequate resources

✅ **Better Solution:**
- Use managed RPC providers (Alchemy/Infura)
- Deploy contracts once to testnet/mainnet
- Backend connects via RPC (just like database connection)
- Cost: $0-$50/month depending on usage

## Quick Start (Testnet)

```bash
# 1. Install dependencies
npm install

# 2. Get Infura key from https://infura.io

# 3. Set environment variables
echo "BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" >> .env

# 4. Deploy contract
npx hardhat run scripts/deploy.js --network sepolia

# 5. Update contract address in lib/blockchain.ts

# 6. Restart backend
npm run server
```

## Monitoring

Once deployed, monitor at:
- **Sepolia**: https://sepolia.etherscan.io/
- **Mumbai**: https://mumbai.polygonscan.com/
- **Mainnet**: https://etherscan.io/

## Current Implementation Status

| Feature | Database | Blockchain | Status |
|---------|----------|------------|--------|
| Hackathon Creation | ✅ | ❌ | DB only |
| Project Submission | ✅ | ❌ | DB only |
| Score Submission | ✅ | ❌ | DB only |
| Prize Info | ✅ | ❌ | DB only |
| Wallet Storage | ✅ | ❌ | Stored but unused |

## Next Steps

1. ✅ Display wallet in UI (TopNav)
2. Choose testnet (Sepolia recommended)
3. Deploy smart contract
4. Update backend to call blockchain functions
5. Test on testnet
6. Deploy to production with mainnet
