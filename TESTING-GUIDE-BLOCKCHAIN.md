# Step-by-Step Testing Guide: Blockchain Mode

## Prerequisites

1. **Install Dependencies**
```bash
cd c:\Users\namanbhat\hackathon-platform
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers@5.7.2
```

2. **Install MetaMask**
- Go to https://metamask.io
- Install browser extension
- Create wallet or import existing one

---

## Phase 1: Local Testing with Hardhat

### Step 1: Initialize Hardhat

```bash
# In project root
npx hardhat init

# Select: "Create a JavaScript project"
# Accept all defaults
```

This creates:
- `hardhat.config.js`
- `contracts/` folder
- `scripts/` folder
- `test/` folder

### Step 2: Start Local Blockchain

```bash
# Terminal 1 - Start Hardhat node
npx hardhat node
```

**Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

... (18 more accounts)
```

**Keep this terminal running!**

### Step 3: Deploy Contract Locally

```bash
# Terminal 2 - Deploy to local network
npx hardhat run scripts/deploy-hackercoin.js --network localhost
```

**Output:**
```
✅ HackerCoinPlatform deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Copy this address!
```

### Step 4: Configure MetaMask for Local Network

1. **Open MetaMask**
2. **Click network dropdown** → "Add Network"
3. **Enter details:**
   ```
   Network Name: Localhost 8545
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
4. **Save**

### Step 5: Import Test Accounts to MetaMask

**Import 4 accounts for different roles:**

1. **Organizer** (Account #0)
   - Click MetaMask → "Import Account"
   - Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Rename: "Local - Organizer"

2. **Judge 1** (Account #1)
   - Import private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Rename: "Local - Judge 1"

3. **Judge 2** (Account #2)
   - Import private key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
   - Rename: "Local - Judge 2"

4. **Participant** (Account #3)
   - Import private key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
   - Rename: "Local - Participant"

Each account will show **10,000 ETH** (10,000,000,000 HackerCoins!)

### Step 6: Update Frontend Configuration

Create `.env.local`:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_CHAIN_ID=31337
```

### Step 7: Start Frontend

```bash
# Terminal 3
npm run dev
```

Visit: http://localhost:3000

---

## Phase 2: Testing Each Role

### Test 1: Organizer Creates Hackathon

**1. Switch to Organizer account in MetaMask**

**2. Toggle Blockchain Mode**
- Look for toggle switch in left sidebar
- Should see: "🔸 Blockchain Mode OFF"
- Click toggle
- MetaMask popup → Connect
- Approve connection

**3. Check Top Nav Bar**
Should show:
```
Balance: 10,000,000,000 HC
(1 HC = 0.000001 ETH)
Wallet: 0xf39F...2266
```

**4. Create Hackathon**
- Go to "Create Hackathon"
- Fill form:
  ```
  Title: AI Innovation Challenge
  Description: Build AI-powered dApps
  Start Date: [today]
  End Date: [1 week from now]
  
  Judges:
  - 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Judge 1)
  - 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Judge 2)
  
  Prizes:
  - 1st: 5,000 HC
  - 2nd: 3,000 HC
  - 3rd: 2,000 HC
  ```

**5. Check Cost Breakdown**
Should display:
```
💰 Cost Breakdown
-------------------
Base Creation Fee:     100 HC
Prize Pool:         10,000 HC
Judge Fees (2 × 5):     10 HC
-------------------
Total Cost:         10,110 HC

≈ 0.01011 ETH
```

**6. Click "Create Hackathon (10,110 HC)"**
- MetaMask popup appears
- Shows: "Send 0.01011 ETH"
- Click "Confirm"
- Wait ~2 seconds
- Success message: "✅ Hackathon created on blockchain!"

**7. Verify in Terminal 1 (Hardhat)**
You'll see transaction logs:
```
eth_sendTransaction
Contract call: HackerCoinPlatform#createHackathon
From: 0xf39f...
Value: 0.01011 ETH
Gas used: 215,432
```

**8. Check Judge Balances**
Switch MetaMask to Judge 1 → Should show **10,000,000,005 HC** (gained 5 HC!)

Switch to Judge 2 → Should show **10,000,000,005 HC** (gained 5 HC!)

✅ **Organizer test complete!**

---

### Test 2: Participant Submits Project

**1. Switch to Participant account in MetaMask** (Account #3)

**2. Connect Wallet**
- Refresh page
- Toggle blockchain mode ON
- Connect wallet
- Should show: **10,000,000,000 HC**

**3. Browse Hackathons**
- Go to "Hackathons" page
- See "AI Innovation Challenge"
- Click to view details

**4. Submit Project**
- Click "Submit Project" button
- Fill form:
  ```
  Project Name: AI Code Reviewer
  Description: Uses GPT-4 to review smart contracts
  GitHub: https://github.com/alice/ai-reviewer
  Demo: https://ai-reviewer.vercel.app
  ```

**5. Check Submission Cost**
Button should show:
```
Submit Project (1 HC)

📝 Submission Fee Breakdown:
• 0.2 HC → Organizer
• 0.8 HC → Judges (split)
```

**6. Click "Submit Project (1 HC)"**
- MetaMask popup
- Shows: "Send 0.000001 ETH"
- Confirm
- Success: "✅ Project submitted!"

**7. Check Balances**
- Participant: **9,999,999,999 HC** (spent 1 HC)
- Judge balances unchanged (they'll get paid at end)
- Organizer gets 0.2 HC immediately

✅ **Participant test complete!**

---

### Test 3: Distribute Prizes

**1. Submit 3-5 more projects** (using different MetaMask accounts)

**2. Switch back to Organizer account**

**3. Go to Hackathon Management**
- Click "Manage" on your hackathon
- See list of all projects
- See accumulated balances:
  ```
  Organizer Balance: 1 HC (from 5 submissions × 0.2)
  Judge Pool: 4 HC (from 5 submissions × 0.8)
  ```

**4. Select Winners**
- Check boxes next to top 3 projects
- Click "Distribute Prizes"

**5. Confirm Distribution**
Shows:
```
🏆 Prize Distribution

Winners:
1st: 0x90F7... → 5,000 HC
2nd: 0x9965... → 3,000 HC
3rd: 0x976E... → 2,000 HC

Judges will receive: 2 HC each (from submission pool)
Organizer will receive: 1 HC (from submission pool)

Total: 10,006 HC
```

**6. Click "Confirm & Distribute"**
- MetaMask popup
- Transaction sent
- Wait ~2 seconds
- "✅ Prizes distributed!"

**7. Verify Balances**
- 1st place winner: Gained 5,000 HC
- 2nd place winner: Gained 3,000 HC
- 3rd place winner: Gained 2,000 HC
- Judge 1: Gained 2 HC (from submissions)
- Judge 2: Gained 2 HC (from submissions)
- Organizer: Gained 1 HC (from submissions)

✅ **Complete flow tested!**

---

## Phase 3: Deploy to Sepolia Testnet

### Step 1: Get Sepolia ETH

1. **Get wallet address from MetaMask**
   - Create new account: "Sepolia - Organizer"
   - Copy address (e.g., `0x1234...`)

2. **Visit faucets:**
   - https://sepoliafaucet.com (0.5 ETH)
   - https://faucet.quicknode.com/ethereum/sepolia (0.1 ETH)
   - https://www.infura.io/faucet/sepolia (0.5 ETH)

3. **Wait 1-2 minutes**
   - Check MetaMask → Should see 0.5 ETH
   - = **500,000 HackerCoins!**

### Step 2: Configure Environment

Create `.env` (for deployment):
```bash
# .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY (optional)
```

**Get Infura Key:**
1. Go to https://infura.io
2. Sign up (free)
3. Create new project
4. Copy "Project ID"
5. URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Step 3: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-hackercoin.js --network sepolia
```

**Output:**
```
✅ HackerCoinPlatform deployed to: 0xABC123...DEF456
```

**Copy this address!**

### Step 4: Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia 0xABC123...DEF456
```

View on Etherscan: https://sepolia.etherscan.io/address/0xABC123...DEF456

### Step 5: Update Frontend for Sepolia

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123...DEF456
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Step 6: Test on Sepolia

**Same steps as local testing, but:**
- Transactions take 12-15 seconds (real blockchain!)
- Costs real gas (from your test ETH)
- Visible on Etherscan
- Can share with others

---

## Troubleshooting

### Issue: MetaMask not connecting
**Solution:**
- Check network is selected (Localhost 8545 or Sepolia)
- Refresh page
- Try disconnecting and reconnecting

### Issue: "Insufficient funds"
**Solution:**
- Check balance in MetaMask
- For local: Import account with 10,000 ETH
- For Sepolia: Get more from faucet

### Issue: Transaction fails
**Solution:**
- Check Hardhat terminal for errors
- Increase gas limit in MetaMask
- Make sure contract address is correct

### Issue: Contract not found
**Solution:**
- Re-deploy contract
- Update NEXT_PUBLIC_CONTRACT_ADDRESS
- Restart frontend (Ctrl+C, `npm run dev`)

---

## Cost Summary

### Local Testing (Free!)
- Unlimited transactions
- Instant confirmation
- Perfect for development

### Sepolia Testnet
**Organizer (create hackathon):**
- Cost: ~0.01 ETH + gas (~0.002 ETH)
- Total: ~0.012 ETH (~12,000 HC)

**Participant (submit project):**
- Cost: 0.000001 ETH + gas (~0.00005 ETH)
- Total: ~0.000051 ETH (~51 HC)

**With 0.5 ETH from faucet, you can:**
- Create 40+ hackathons
- Submit 10,000+ projects
- Run complete tests many times!

---

## Quick Reference

### HackerCoin Conversion
```
1 HC = 0.000001 ETH
100 HC = 0.0001 ETH
1,000 HC = 0.001 ETH
10,000 HC = 0.01 ETH
```

### Test Accounts (Local)
```
Organizer:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Judge 1:      0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Judge 2:      0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Participant:  0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### Commands
```bash
# Start local blockchain
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy-hackercoin.js --network localhost

# Deploy to Sepolia
npx hardhat run scripts/deploy-hackercoin.js --network sepolia

# Start frontend
npm run dev

# Run tests
npx hardhat test
```

---

## Success Checklist

- [ ] Local blockchain running
- [ ] Contract deployed locally
- [ ] MetaMask connected to localhost
- [ ] 4 test accounts imported
- [ ] Frontend showing blockchain mode toggle
- [ ] Organizer can create hackathon with costs shown
- [ ] Judges receive 5 HC immediately
- [ ] Participant can submit project for 1 HC
- [ ] Prizes distribute correctly
- [ ] All balances update correctly
- [ ] Ready for Sepolia deployment!

🎉 **You're ready to test blockchain mode!**
