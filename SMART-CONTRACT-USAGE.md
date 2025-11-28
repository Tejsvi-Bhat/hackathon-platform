# Smart Contract Integration Strategy

## Current vs Proposed Architecture

### Current State: ❌ Database Only
```
User → Backend API → PostgreSQL Database
```
- Wallet addresses stored as strings
- No blockchain interaction
- Centralized data storage

### Proposed State: ✅ Hybrid (Database + Blockchain)
```
User → Backend API → PostgreSQL Database (fast reads/writes)
                  ↓
                  → Smart Contract on Blockchain (immutable records)
```

---

## How Smart Contracts Will Be Used

### 1. **Prize Distribution** 💰
**Current**: Prizes are just records in database  
**With Smart Contracts**:
```solidity
// When hackathon ends, organizer can release prizes
contract.distributePrizes(hackathonId, [winner1, winner2, winner3])
```

**Flow**:
1. User deposits ETH/MATIC into smart contract when creating hackathon
2. Contract holds funds in escrow
3. After judging, organizer calls `releasePrizes()`
4. Smart contract automatically transfers funds to winner wallets
5. **Transaction hash stored in database for proof**

**Benefits**:
- Winners get paid instantly
- No manual transfers
- Transparent and trustless

---

### 2. **Immutable Scoring** 📊
**Current**: Judges can edit scores in database  
**With Smart Contracts**:
```solidity
// Judge submits score (cannot be changed later)
contract.submitScore(projectId, technicalScore, innovationScore, ...)
```

**Flow**:
1. Judge submits score through frontend
2. Backend calls smart contract
3. Score permanently recorded on blockchain
4. **Database syncs with blockchain data for fast queries**

**Benefits**:
- Scores cannot be manipulated
- Complete transparency
- Judges accountable for their scores

---

### 3. **NFT Achievement Badges** 🏆
**Current**: No badges system  
**With Smart Contracts**:
```solidity
// Mint NFT for winners
contract.mintWinnerNFT(winnerAddress, hackathonId, position)
```

**Flow**:
1. Winner finalized
2. Smart contract mints unique NFT
3. NFT appears in winner's wallet
4. Can be displayed on profile/portfolio

**Benefits**:
- Verifiable achievements
- Portable credentials
- Collectible and tradeable

---

###

 4. **Project Submission Verification** ✅
**Current**: Anyone can claim to be team member  
**With Smart Contracts**:
```solidity
// All team members must sign
contract.submitProject(projectId, [member1, member2, member3])
```

**Flow**:
1. Team lead initiates submission
2. All team members must sign with their wallet
3. Signatures verified on-chain
4. Project locked after submission deadline

**Benefits**:
- Proves all team members agreed
- Prevents false attribution
- Tamper-proof team records

---

## Implementation in Production (Railway)

### Architecture
```
Railway Backend API
    ↓
Alchemy/Infura RPC Provider (HTTPS)
    ↓
Ethereum Sepolia / Polygon Mumbai Testnet
    ↓
Smart Contracts (deployed once)
```

### Environment Variables on Railway
```env
# Database
DATABASE_URL=postgresql://...

# Blockchain RPC
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=0x1234... (deployed contract address)
DEPLOYER_PRIVATE_KEY=0xabc... (for contract interactions)

# Network
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_CHAIN_ID=11155111
```

### Backend Integration Example
```typescript
// server/index.ts
import { ethers } from 'ethers';

// Initialize provider (connects to Infura/Alchemy)
const provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

// Load deployed contract
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider.getSigner() // Uses DEPLOYER_PRIVATE_KEY
);

// When judge submits score
app.post('/api/projects/:id/score', async (req, res) => {
  // 1. Save to database (fast)
  await pool.query('INSERT INTO scores ...');
  
  // 2. Submit to blockchain (slow but permanent)
  try {
    const tx = await contract.submitScore(
      projectId,
      technicalScore,
      innovationScore,
      presentationScore,
      impactScore
    );
    await tx.wait(); // Wait for confirmation
    
    // 3. Store transaction hash
    await pool.query(
      'UPDATE scores SET blockchain_tx = $1 WHERE id = $2',
      [tx.hash, scoreId]
    );
  } catch (error) {
    // Blockchain failed, but database has record
    console.error('Blockchain error:', error);
  }
  
  res.json({ success: true });
});
```

---

## Data Flow Examples

### Example 1: Creating Hackathon with Prize Pool
```
1. Organizer fills form → name, dates, $10,000 prize
2. Frontend: Organizer connects MetaMask
3. Backend creates hackathon in database
4. Backend calls: contract.createHackathon{value: 10000 ETH}()
5. Smart contract emits event: HackathonCreated(id, organizer)
6. Backend stores blockchain_id in database
7. Funds locked in contract until winners decided
```

### Example 2: Judge Scoring Project
```
1. Judge fills scoring form
2. Backend saves to database (ID=123, scores=85,90,75,80)
3. Backend calls: contract.scoreProject(projectId=456, [85,90,75,80])
4. Blockchain tx: 0xabc123... (takes ~15 seconds)
5. Backend updates: scores.blockchain_tx = '0xabc123...'
6. Frontend shows: "✓ Score recorded on blockchain"
```

### Example 3: Winner Gets Prize
```
1. Organizer clicks "Release Scores"
2. Backend calculates winners from database
3. Backend calls: contract.distributePrizes([winner1, winner2, winner3])
4. Smart contract:
   - Transfers 5 ETH to winner1
   - Transfers 3 ETH to winner2
   - Transfers 2 ETH to winner3
5. Winners see balance in wallet instantly
6. Database records tx hashes for each transfer
```

---

## User Wallet Usage

### What Users Need Wallets For:

1. **Organizers**:
   - Deposit prize money into smart contract
   - Release prizes after judging
   - Verify identity (sign transactions)

2. **Judges**:
   - Submit tamper-proof scores
   - Prove they are authorized judges
   - Accountable for scoring

3. **Participants**:
   - Receive prize money automatically
   - Sign project submissions
   - Receive NFT badges
   - Display verifiable achievements

4. **Everyone**:
   - View transparent transaction history
   - Verify any claim on blockchain explorer
   - Trust the system without trusting organizers

---

## Current Deployment Plan

### Phase 1: Read-Only Balance Display ✅ (This Update)
- Show wallet balance in nav bar
- No smart contract calls yet
- Uses public RPC to read blockchain state

### Phase 2: Prize Escrow (Next)
- Deploy HackathonPlatform.sol to Sepolia
- Organizers deposit prizes when creating hackathon
- Contract holds funds until winners announced

### Phase 3: Immutable Scoring
- Judges submit scores to blockchain
- Database syncs with blockchain
- UI shows "Verified on Blockchain" badge

### Phase 4: NFT Badges
- Deploy ERC-721 contract for achievement NFTs
- Mint badges for winners
- Display NFTs on user profiles

### Phase 5: Full Decentralization
- All critical operations on-chain
- Database becomes cache layer
- Frontend can read directly from blockchain

---

## Cost Estimation (Sepolia Testnet)

### Free Forever (Test Network):
- Gas fees: **FREE** (test ETH from faucets)
- RPC calls: **FREE** (Infura/Alchemy free tier)
- Contract deployment: **FREE** (one-time, test ETH)

### Production (Ethereum Mainnet):
- Contract deployment: ~$50-200 (one time)
- Each score submission: ~$2-5
- Prize distribution: ~$10-30
- **Alternative: Use Polygon Mainnet (100x cheaper!)**

### Production (Polygon Mainnet) - RECOMMENDED:
- Contract deployment: ~$0.50 (one time)
- Each score submission: ~$0.02
- Prize distribution: ~$0.10
- RPC provider: Free tier sufficient

---

## Security Considerations

### Private Keys:
```env
# ⚠️ NEVER commit to git!
DEPLOYER_PRIVATE_KEY=0xabc123...

# Railway: Store in Environment Variables dashboard
# Local: Store in .env (git ignored)
```

### Recommended: Use Separate Wallets
- **Deployer Wallet**: Only for deploying contracts
- **Admin Wallet**: For managing hackathons
- **Treasury Wallet**: Holds prize funds
- **Judge Wallets**: Individual judge accounts

### Best Practices:
1. Use hardware wallet for production
2. Multi-sig wallet for large prize pools
3. Time-locks for sensitive operations
4. Audit smart contracts before mainnet

---

## Summary

**Current State**: Wallet addresses collected but not used

**After This Update**: 
- ✅ Users see their Sepolia ETH balance
- ✅ Can copy address
- ✅ Link to faucet to get test tokens
- ❌ No smart contract calls yet (backend needs updating)

**Next Steps**:
1. Deploy smart contracts to Sepolia testnet
2. Update backend to call contract functions
3. Test prize distribution with test ETH
4. Once stable, deploy to Polygon Mumbai
5. Eventually move to Polygon Mainnet for production
