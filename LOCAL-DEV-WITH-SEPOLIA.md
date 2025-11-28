# Local Development with Sepolia Testnet

## Why Use Testnet Locally?

**Benefits:**
- ✅ Real blockchain experience (12s confirmations)
- ✅ Test with actual Etherscan verification
- ✅ No need to run Hardhat node
- ✅ Share with team (same contract address)
- ✅ Persistent data (survives restarts)

**Tradeoffs:**
- ⏱️ Slower than local (12s vs instant)
- 💰 Need test ETH from faucet
- 🌐 Requires internet connection

---

## Setup: Local Development → Sepolia Testnet

### Step 1: Get Test ETH (One-Time, 5 min)

**Create 4 MetaMask Accounts for Testing:**

```
Account 1: "Dev - Organizer"
Account 2: "Dev - Judge 1"
Account 3: "Dev - Judge 2"
Account 4: "Dev - Participant"
```

**Visit Faucets for EACH Account:**

1. **Alchemy Faucet** (0.5 ETH, easiest)
   - https://sepoliafaucet.com
   - Login with Alchemy account (free)
   - Paste wallet address
   - Get 0.5 ETH = 500,000 HC

2. **Infura Faucet** (0.5 ETH)
   - https://www.infura.io/faucet/sepolia
   - Sign in
   - Get another 0.5 ETH

3. **QuickNode Faucet** (0.1 ETH, backup)
   - https://faucet.quicknode.com/ethereum/sepolia
   - Twitter verification required
   - Get 0.1 ETH

**Target:** Get ~1 ETH (1,000,000 HC) per account

**Total across 4 accounts: 4 ETH = 4,000,000 HC** (enough for extensive testing!)

---

### Step 2: Get Infura API Key (Free)

1. **Visit:** https://infura.io
2. **Sign up** (free forever for testnet)
3. **Create New Project:**
   - Name: "Hackathon Platform Dev"
   - Product: "Ethereum"
4. **Copy API Key** from dashboard
5. **Note your endpoint:**
   ```
   https://sepolia.infura.io/v3/YOUR_API_KEY_HERE
   ```

**Alternative RPC Providers (if Infura down):**
- Alchemy: https://www.alchemy.com (also free)
- QuickNode: https://www.quicknode.com (free tier)
- Public: https://rpc.sepolia.org (no API key, but slower)

---

### Step 3: Configure Environment

Create `.env` in project root:

```bash
# c:\Users\namanbhat\hackathon-platform\.env

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY_HERE

# Deployer wallet (use your Organizer account)
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_METAMASK

# Optional: Etherscan verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**How to Get Private Key from MetaMask:**
1. Open MetaMask
2. Click 3 dots → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy (starts with `0x`)

⚠️ **NEVER commit this file to git!** (Already in .gitignore)

---

### Step 4: Update Frontend Config

Update `.env.local`:

```bash
# c:\Users\namanbhat\hackathon-platform\.env.local

# Point to Railway backend
NEXT_PUBLIC_API_URL=https://hackathon-platform-production-2055.up.railway.app

# Use Sepolia testnet (contract address will be filled after deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY_HERE
```

---

### Step 5: Deploy to Sepolia (One-Time)

```powershell
# From project root
cd C:\Users\namanbhat\hackathon-platform

# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy-hackercoin.js --network sepolia
```

**Output:**
```
Deploying HackerCoinPlatform...
✅ HackerCoinPlatform deployed to: 0xABC123...DEF456

📋 Contract Details:
-------------------
Network: sepolia
Contract Address: 0xABC123...DEF456
Deployer: 0xYourAddress...

💰 Constants:
- 1 HackerCoin = 0.000001 ETH
- Create Hackathon Fee: 0.0001 ETH (100 HC)
- Judge Base Fee: 0.000005 ETH (5 HC)
- Submission Fee: 0.000001 ETH (1 HC)

📝 Next Steps:
1. Copy contract address to .env.local:
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123...DEF456
```

**Copy the contract address!**

**Update `.env.local`:**
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123...DEF456
```

---

### Step 6: Verify Contract on Etherscan (Optional, Recommended)

**Get Etherscan API Key:**
1. Visit https://etherscan.io
2. Sign up
3. My Profile → API Keys → Add
4. Copy key

**Add to `.env`:**
```bash
ETHERSCAN_API_KEY=YOUR_KEY_HERE
```

**Verify:**
```powershell
npx hardhat verify --network sepolia 0xABC123...DEF456
```

**View on Etherscan:**
```
https://sepolia.etherscan.io/address/0xABC123...DEF456
```

Now anyone can:
- Read contract code
- See all transactions
- Verify it's legitimate

---

### Step 7: Start Development

**No need to run Hardhat node!** Just start your frontend:

```powershell
# Terminal 1
npm run dev
```

**That's it!** Your app now connects to Sepolia testnet.

---

## Development Workflow with Sepolia

### Daily Workflow:

```powershell
# Morning
1. Open terminal
2. cd C:\Users\namanbhat\hackathon-platform
3. npm run dev
4. Open http://localhost:3000
5. Toggle blockchain mode ON
6. Start testing!
```

**No blockchain node to manage!**

---

## Testing with Multiple Accounts

### Quick Account Switching in MetaMask:

**Organizer Flow:**
1. Switch MetaMask to "Dev - Organizer"
2. Toggle blockchain mode ON
3. Create hackathon
4. See cost: 10,110 HC
5. Confirm transaction
6. Wait 12-15 seconds
7. ✅ Transaction confirmed!
8. View on Etherscan: Click transaction hash

**Judge Flow:**
1. Switch to "Dev - Judge 1"
2. Refresh page
3. Check balance: Should have +5 HC!
4. View transaction on Etherscan

**Participant Flow:**
1. Switch to "Dev - Participant"
2. Browse hackathons
3. Submit project (1 HC)
4. Wait 12-15 seconds
5. ✅ Submitted!

---

## Monitor Transactions in Real-Time

### Option 1: Etherscan
```
Visit: https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS
See all your transactions live!
```

### Option 2: In-App (Add to Frontend)
```typescript
// Show transaction status
const [txStatus, setTxStatus] = useState('pending');

const tx = await contract.createHackathon(...);
setTxStatus('confirming');

await tx.wait();
setTxStatus('confirmed');

// Show link to Etherscan
<a href={`https://sepolia.etherscan.io/tx/${tx.hash}`}>
  View on Etherscan
</a>
```

---

## Compare: Local vs Testnet Development

### Hardhat Local Node
```
✅ Instant (0 seconds)
✅ Unlimited test ETH
✅ Offline development
✅ Perfect for rapid iteration

❌ Not real blockchain
❌ Resets when stopped
❌ Can't share with others
❌ No Etherscan verification
```

### Sepolia Testnet
```
✅ Real blockchain experience
✅ Persistent data
✅ Etherscan verification
✅ Share with team (same contract)
✅ Simulate production

⏱️ 12-15 second confirmations
💰 Need test ETH (free from faucets)
🌐 Requires internet
```

**Recommendation:** Use both!
- **Rapid dev:** Local Hardhat node
- **Final testing:** Sepolia testnet
- **Production:** Polygon mainnet (cheaper than Ethereum)

---

## Cost Tracking on Sepolia

### Monitor Your Test ETH:

**Starting Balance:**
```
Organizer:   1.0 ETH (1,000,000 HC)
Judge 1:     1.0 ETH (1,000,000 HC)
Judge 2:     1.0 ETH (1,000,000 HC)
Participant: 1.0 ETH (1,000,000 HC)
```

**After 1 Complete Test Cycle:**
```
Create Hackathon (organizer): -0.01011 ETH
Submit 5 Projects (participants): -0.000005 ETH
Distribute Prizes: -0.0005 ETH (gas)

Total Used: ~0.011 ETH
Tests Possible: ~90 complete cycles with 1 ETH!
```

### Refill When Needed:
```powershell
# Check balance
node -e "console.log(parseFloat('YOUR_BALANCE') * 1000000 + ' HC')"

# If < 100,000 HC (0.1 ETH), get more from faucet
# Visit: https://sepoliafaucet.com
```

---

## Debugging on Sepolia

### View Transaction Details:

1. **Get Transaction Hash** (from MetaMask or console.log)
2. **Visit Etherscan:**
   ```
   https://sepolia.etherscan.io/tx/0xYOUR_TX_HASH
   ```
3. **Check:**
   - Status: Success ✅ or Failed ❌
   - Gas Used
   - Input Data
   - Events Emitted
   - Internal Transactions

### Common Issues:

**Transaction Failed:**
```
Check Etherscan error message:
- "Insufficient funds" → Need more ETH
- "Revert reason" → Contract logic error
- "Out of gas" → Increase gas limit
```

**Transaction Pending:**
```
- Wait 30 seconds
- Check Etherscan (might be confirmed but MetaMask delayed)
- If stuck: Speed up in MetaMask (increase gas)
```

---

## Team Collaboration

### Share Contract with Team:

**Send teammates:**
1. Contract Address: `0xABC123...`
2. Faucet links (to get test ETH)
3. Updated `.env.local` config

**They can:**
- Connect to same contract
- See all hackathons created
- Submit projects
- Test complete flows

**Everyone sees same blockchain state!**

---

## Environment Switching

### Switch Between Networks Easily:

```bash
# .env.local

# For Sepolia Testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0xSepoliaAddress...
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111

# For Local Hardhat (when needed)
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
# NEXT_PUBLIC_NETWORK=localhost
# NEXT_PUBLIC_CHAIN_ID=31337
```

**Comment/uncomment as needed!**

---

## Production-Like Testing

### Simulate Real-World Conditions:

**Weekend Hackathon Simulation:**
```
Friday:
- Organizer creates hackathon (Sepolia)
- 5 judges added (each gets 5 HC)

Saturday:
- 20 participants submit projects (20 HC in fees)
- Projects accumulate throughout day
- View on Etherscan: All submissions visible

Sunday:
- Organizer reviews projects
- Distributes prizes
- All winners paid instantly
- Judges receive their share
- View final state on Etherscan

Total time: Real 3-day test
Total cost: ~0.02 ETH (20,000 HC)
```

---

## Quick Reference

### Essential URLs:

**Faucets:**
- https://sepoliafaucet.com (fastest, 0.5 ETH)
- https://www.infura.io/faucet/sepolia (0.5 ETH)
- https://faucet.quicknode.com/ethereum/sepolia (0.1 ETH)

**RPC Providers:**
- Infura: https://infura.io
- Alchemy: https://www.alchemy.com
- Public: https://rpc.sepolia.org

**Explorers:**
- Etherscan: https://sepolia.etherscan.io
- Blockscout: https://sepolia.blockscout.com

### Key Commands:

```powershell
# Deploy to Sepolia
npx hardhat run scripts/deploy-hackercoin.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Check balance (in console)
node -e "console.log(parseFloat('0.5') * 1000000 + ' HC')"

# Start dev server
npm run dev
```

---

## Summary

**To use Sepolia testnet locally:**

1. ✅ Get test ETH from faucets (~1 ETH per account)
2. ✅ Get Infura API key (free)
3. ✅ Deploy contract once to Sepolia
4. ✅ Update `.env.local` with contract address
5. ✅ Start `npm run dev`
6. ✅ Test with real blockchain!

**Advantages:**
- Real blockchain experience during development
- No local node management
- Persistent data
- Share with team
- Etherscan verification
- Closer to production

**You get best of both worlds:**
- Develop locally (localhost:3000)
- Use real blockchain (Sepolia testnet)
- Fast iteration + real testing

🚀 **Ready to develop with Sepolia!**
