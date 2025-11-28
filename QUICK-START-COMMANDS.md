# Quick Start Commands - Blockchain Mode

## 🚀 Fast Track to Testing (10 minutes)

### Step 1: Install Dependencies (1 min)
```powershell
cd C:\Users\namanbhat\hackathon-platform
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers@5.7.2
```

### Step 2: Initialize Hardhat (1 min)
```powershell
npx hardhat init
# Select: "Create a JavaScript project"
# Press Enter for all prompts
```

### Step 3: Start Local Blockchain (Terminal 1)
```powershell
npx hardhat node
```
**Leave this running!** You'll see 20 accounts with 10,000 ETH each.

### Step 4: Deploy Contract (Terminal 2)
```powershell
npx hardhat run scripts/deploy-hackercoin.js --network localhost
```
**Copy the contract address from output!**

### Step 5: Configure Environment
```powershell
# Create .env.local
@"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_CHAIN_ID=31337
"@ | Out-File -FilePath .env.local -Encoding utf8
```
**Replace contract address with yours!**

### Step 6: Start Frontend (Terminal 3)
```powershell
npm run dev
```
Visit: http://localhost:3000

### Step 7: Configure MetaMask (2 min)
1. **Add Network:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Accounts:**
   ```
   Organizer:   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Judge 1:     0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Judge 2:     0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   Participant: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
   ```

### Step 8: Test! (5 min)
1. Toggle blockchain mode ON in sidebar
2. Connect MetaMask (Organizer account)
3. Create hackathon → See cost: 10,110 HC
4. Switch to Participant → Submit project (1 HC)
5. Check balances → Judges should have +5 HC!

✅ **Done!**

---

## 🌐 Deploy to Sepolia Testnet

### Step 1: Get Test ETH (5 min)
```
1. Create new MetaMask account: "Sepolia - Deployer"
2. Copy your address
3. Visit: https://sepoliafaucet.com
4. Paste address → Get 0.5 ETH
5. Wait 2 minutes
```

### Step 2: Configure Deployment
```powershell
# Create .env file
@"
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_FROM_METAMASK
"@ | Out-File -FilePath .env -Encoding utf8
```

**Get Infura Key:**
1. Visit https://infura.io → Sign up (free)
2. Create project → Copy "Project ID"
3. Replace `YOUR_INFURA_KEY` with it

### Step 3: Deploy to Sepolia
```powershell
npx hardhat run scripts/deploy-hackercoin.js --network sepolia
```
**Wait 30-60 seconds. Copy contract address!**

### Step 4: Update Frontend
```powershell
# Update .env.local
@"
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_ADDRESS
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### Step 5: Test on Sepolia
1. Switch MetaMask to Sepolia network
2. Refresh frontend
3. Toggle blockchain mode
4. Test with real testnet!

**Transactions take 12-15 seconds (real blockchain)**

---

## 🐛 Troubleshooting Commands

### Check Contract Deployment
```powershell
npx hardhat console --network localhost
```
```javascript
const contract = await ethers.getContractAt("HackerCoinPlatform", "0x5FbDB2...");
await contract.hackathonCount(); // Should return 0 initially
```

### Check Account Balance
```powershell
npx hardhat run --network localhost scripts/check-balance.js
```

### Restart Everything
```powershell
# Kill all terminals (Ctrl+C)
# Terminal 1: 
npx hardhat node

# Terminal 2:
npx hardhat run scripts/deploy-hackercoin.js --network localhost

# Terminal 3:
npm run dev
```

### Reset MetaMask
```
Settings → Advanced → Clear activity tab data
(Do this if transactions are stuck)
```

---

## 📋 Verification Commands

### After Deploying Locally
```powershell
# Check contract is deployed
npx hardhat verify --network localhost CONTRACT_ADDRESS

# Run tests (if you create test file)
npx hardhat test

# Check gas usage
npx hardhat run scripts/gas-estimate.js --network localhost
```

### After Deploying to Sepolia
```powershell
# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# View on Etherscan
# Visit: https://sepolia.etherscan.io/address/CONTRACT_ADDRESS
```

---

## 🎯 Quick Test Scenarios

### Scenario 1: Full Happy Path (3 min)
```
1. Organizer creates hackathon (10,110 HC)
2. 3 participants submit projects (3 HC total)
3. Organizer distributes prizes
4. Check all balances updated correctly
```

### Scenario 2: Multiple Hackathons (5 min)
```
1. Create 3 different hackathons
2. Submit to each
3. Verify isolation (separate prize pools)
```

### Scenario 3: Edge Cases (5 min)
```
1. Try to submit with insufficient balance
2. Try to distribute prizes twice (should fail)
3. Try to submit to inactive hackathon (should fail)
```

---

## 💡 Pro Tips

### Speed Up Testing
```powershell
# Use Hardhat's snapshot feature
npx hardhat node --no-deploy

# Run multiple accounts in parallel
# Terminal 1: Organizer actions
# Terminal 2: Participant actions
# Terminal 3: Judge actions
```

### Debug Transactions
```javascript
// In Hardhat console
const tx = await contract.createHackathon(...);
const receipt = await tx.wait();
console.log(receipt.logs); // See all events
```

### Check Contract State
```javascript
const hackathon = await contract.getHackathon(1);
console.log({
  name: hackathon.name,
  prizePool: ethers.utils.formatEther(hackathon.prizePoolWei),
  judges: await contract.getJudges(1)
});
```

---

## 🔥 Common Issues & Fixes

### Issue: "Cannot find module 'hardhat'"
```powershell
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Issue: "Network localhost not found"
```powershell
# Make sure Hardhat node is running in Terminal 1
npx hardhat node
```

### Issue: "Insufficient funds"
```
Make sure you imported the correct private key
Check MetaMask is on "Localhost 8545" network
```

### Issue: "Transaction failed"
```
Check Hardhat terminal for error message
Try increasing gas limit
Restart Hardhat node
```

### Issue: Contract not found
```powershell
# Re-deploy
npx hardhat run scripts/deploy-hackercoin.js --network localhost
# Update .env.local with new address
```

---

## 📞 Reference

### Contract Address (Local)
```
Usually: 0x5FbDB2315678afecb367f032d93F642f64180aa3
(First deployment on Hardhat)
```

### Test Accounts (Local)
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10,000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10,000 ETH)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10,000 ETH)
Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (10,000 ETH)
```

### Conversion
```
1 HC = 0.000001 ETH = 1,000,000 wei
100 HC = 0.0001 ETH
10,000 HC = 0.01 ETH
```

### Costs
```
Create Hackathon: 100 HC + prizes + (5 HC × judges)
Submit Project: 1 HC
Registration: FREE
```

---

## 🎓 Next Steps After Testing

1. **Frontend Integration**
   - Implement BlockchainContext
   - Add toggle in Sidebar
   - Update TopNav
   - Show costs on buttons

2. **Production Deploy**
   - Deploy to Sepolia (done above)
   - Test thoroughly
   - Get feedback
   - Move to mainnet (Polygon cheaper than Ethereum)

3. **Documentation**
   - User guide for MetaMask
   - Video tutorial
   - FAQ

---

## ⚡ One-Line Commands for Lazy People

```powershell
# Complete local setup
npx hardhat init; npx hardhat node

# Deploy & get address
npx hardhat run scripts/deploy-hackercoin.js --network localhost | Select-String "deployed to"

# Quick restart
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process; npx hardhat node

# Check balance in HC
node -e "console.log(parseFloat(process.argv[1]) * 1000000 + ' HC')" 0.01
```

---

**Remember:** Always keep Terminal 1 (Hardhat node) running while testing! 🔥
