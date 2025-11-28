# MetaMask Setup Guide for Blockchain Testing

## Step 1: Install MetaMask (5 minutes)

### Download MetaMask Browser Extension:

**Chrome/Brave/Edge:**
1. Visit: https://metamask.io/download/
2. Click "Install MetaMask for Chrome"
3. Click "Add to Chrome" → "Add Extension"
4. MetaMask icon appears in browser toolbar (top-right)

**Firefox:**
1. Visit: https://metamask.io/download/
2. Click "Install MetaMask for Firefox"
3. Click "Add to Firefox" → "Add"

**Alternative: Mobile App**
- iOS: https://apps.apple.com/app/metamask/id1438144202
- Android: https://play.google.com/store/apps/details?id=io.metamask

---

## Step 2: Create Your First Wallet (3 minutes)

### Initial Setup:

1. **Click MetaMask icon** in browser toolbar
2. **Click "Get Started"**
3. **Click "Create a new wallet"**

4. **Agree to Terms:**
   - Read privacy policy
   - Click "I agree"

5. **Create Password:**
   - Enter strong password (8+ characters)
   - Confirm password
   - Check "I understand MetaMask cannot recover..."
   - Click "Create a new wallet"

6. **Secret Recovery Phrase (CRITICAL!):**
   ```
   ⚠️ THIS IS THE MOST IMPORTANT STEP!
   ```
   - Click "Secure my wallet"
   - Click "Reveal Secret Recovery Phrase"
   - **Write down 12 words on paper** (in order!)
   - Store in safe place (NOT on computer!)
   - Click "Next"
   - Confirm by selecting words in order
   - Click "Confirm"

7. **Done! You have a wallet!**
   - Your first account: "Account 1"
   - Address: 0x1234...5678 (42 characters)

---

## Step 3: Create Multiple Test Accounts (2 minutes)

### You Need 4 Accounts for Testing:

**Create Account 2, 3, 4:**

1. **Click MetaMask icon**
2. **Click account circle** (top-right)
3. **Click "Add account or hardware wallet"**
4. **Click "Add a new account"**
5. **Name it:** "Dev - Organizer"
6. **Click "Create"**

**Repeat for 3 more accounts:**
```
Account 1 → Rename to: "Dev - Organizer"
Account 2 → Create as: "Dev - Judge 1"
Account 3 → Create as: "Dev - Judge 2"  
Account 4 → Create as: "Dev - Participant"
```

**How to Rename:**
1. Click account dropdown
2. Click ⋮ (three dots) next to account name
3. Click "Account details"
4. Click edit icon (pencil)
5. Enter new name
6. Click ✓

---

## Step 4: Add Sepolia Testnet (2 minutes)

### Manual Method:

1. **Click MetaMask icon**
2. **Click network dropdown** (top-left, shows "Ethereum Mainnet")
3. **Click "Add network"** (at bottom)
4. **Click "Add a network manually"**
5. **Enter Sepolia details:**

```
Network Name: Sepolia Testnet
New RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer URL: https://sepolia.etherscan.io
```

6. **Click "Save"**
7. **Click "Switch to Sepolia Testnet"**

### Easy Method (Automatic):

Visit: https://chainlist.org/chain/11155111
Click "Connect Wallet" → "Add to MetaMask"

---

## Step 5: Get Test ETH from Faucets (5 min per account)

### For Each of Your 4 Accounts:

**Switch to Account:**
1. Click MetaMask
2. Select "Dev - Organizer" (or current account)
3. **Copy address** (click to copy): `0x1234...5678`

**Visit Faucets:**

#### Faucet 1: Alchemy (Best, 0.5 ETH)
```
URL: https://sepoliafaucet.com
Steps:
1. Sign up for Alchemy account (free, email only)
2. Paste your wallet address
3. Click "Send Me ETH"
4. Wait 30 seconds
5. ✅ 0.5 ETH received (= 500,000 HC)
```

#### Faucet 2: Infura (0.5 ETH)
```
URL: https://www.infura.io/faucet/sepolia
Steps:
1. Sign in with Infura account
2. Paste wallet address
3. Get 0.5 ETH
```

#### Faucet 3: QuickNode (0.1 ETH, backup)
```
URL: https://faucet.quicknode.com/ethereum/sepolia
Steps:
1. Connect Twitter (verification)
2. Paste wallet address
3. Get 0.1 ETH
```

**Check Balance in MetaMask:**
- Should show: 0.5 - 1.0 ETH
- In HackerCoins: 500,000 - 1,000,000 HC

**Repeat for all 4 accounts!**

---

## Step 6: Export Private Keys (For Development)

⚠️ **ONLY for development/testing! NEVER share real wallet keys!**

### Get Private Key for Each Account:

1. **Click MetaMask**
2. **Select account** (e.g., "Dev - Organizer")
3. **Click ⋮ (three dots)** → "Account details"
4. **Click "Show private key"**
5. **Enter MetaMask password**
6. **Click to copy private key**
7. **Save temporarily** (you'll need this for deployment)

**Private keys look like:**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Save all 4 private keys in a text file:**
```
Dev - Organizer: 0xabc123...
Dev - Judge 1: 0xdef456...
Dev - Judge 2: 0xghi789...
Dev - Participant: 0xjkl012...
```

---

## Step 7: Configure Environment Files

### Create `.env` (Backend Config):

```bash
# c:\Users\namanbhat\hackathon-platform\.env

# Sepolia RPC URL (get API key from infura.io)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY

# Deployer wallet (use "Dev - Organizer" private key)
DEPLOYER_PRIVATE_KEY=0xYOUR_ORGANIZER_PRIVATE_KEY

# Optional: Etherscan verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Update `.env.local` (Frontend Config):

```bash
# c:\Users\namanbhat\hackathon-platform\.env.local

# API URL
NEXT_PUBLIC_API_URL=https://hackathon-platform-production-2055.up.railway.app

# Blockchain config (contract address after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
```

---

## Step 8: Test Your Setup

### Verify Everything Works:

**1. Check MetaMask:**
```
✅ 4 accounts created
✅ Each account has 0.5-1 ETH
✅ Network shows "Sepolia Testnet"
```

**2. Test Transaction:**
```
1. Click MetaMask
2. Click "Send"
3. Enter your own address (test sending to yourself)
4. Amount: 0.001 ETH
5. Click "Next" → "Confirm"
6. Wait 12 seconds
7. ✅ Transaction confirmed!
8. Click transaction to view on Etherscan
```

**3. Switch Accounts:**
```
1. Click MetaMask
2. Click account dropdown
3. Select different account
4. ✅ Address changes
5. Balance shows correctly
```

---

## Quick Reference

### Essential MetaMask Actions:

**Copy Wallet Address:**
- Click account name → Copies to clipboard
- Format: `0x1234...5678` (42 chars)

**Switch Accounts:**
- Click account dropdown → Select account

**Switch Networks:**
- Click network dropdown → Select network

**View Transaction:**
- Click transaction → Opens Etherscan

**Send ETH:**
- Click "Send" → Enter address → Amount → Confirm

**Add Token (Future):**
- Click "Import tokens" → Enter contract address

### Account Summary (After Setup):

```
Account 1: "Dev - Organizer"
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 1.0 ETH (1,000,000 HC)
Role: Create hackathons

Account 2: "Dev - Judge 1"  
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Balance: 1.0 ETH (1,000,000 HC)
Role: Review projects

Account 3: "Dev - Judge 2"
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Balance: 1.0 ETH (1,000,000 HC)
Role: Review projects

Account 4: "Dev - Participant"
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Balance: 1.0 ETH (1,000,000 HC)
Role: Submit projects
```

---

## Security Best Practices

### DO's ✅

- ✅ Write down recovery phrase on paper
- ✅ Store recovery phrase in safe place
- ✅ Use strong password for MetaMask
- ✅ Lock MetaMask when not using
- ✅ Verify website URLs before connecting
- ✅ Use separate accounts for testing vs real funds

### DON'Ts ❌

- ❌ Never share recovery phrase with anyone
- ❌ Never type recovery phrase on any website
- ❌ Never screenshot recovery phrase
- ❌ Never email/message recovery phrase
- ❌ Never store recovery phrase digitally
- ❌ Never share private keys (except for dev testing)

### For Development Testing:

```
⚠️ The 4 test accounts you created are ONLY for Sepolia testnet.
⚠️ They contain test ETH with no real value.
⚠️ OK to share private keys of these test accounts.
⚠️ DO NOT use these accounts on Ethereum mainnet!
```

---

## Troubleshooting

### MetaMask Not Appearing?

**Check browser extensions:**
1. Chrome: `chrome://extensions/`
2. Enable MetaMask if disabled
3. Pin to toolbar (puzzle icon → pin MetaMask)

### Can't Get Test ETH?

**Try different faucets:**
- Some faucets have daily limits
- Try again tomorrow
- Use multiple faucets for each account
- Join Discord/Twitter for more faucets

### Transaction Failed?

**Common causes:**
- Insufficient balance (get more from faucet)
- Gas price too low (increase in MetaMask)
- Contract error (check Etherscan for details)

### Wrong Network?

**Switch to Sepolia:**
1. Click network dropdown (top-left)
2. Select "Sepolia Testnet"
3. If not listed: Add manually (see Step 4)

---

## Next Steps

After completing this guide:

1. ✅ You have MetaMask installed
2. ✅ You have 4 test accounts with ETH
3. ✅ You're on Sepolia testnet
4. ✅ You have private keys saved

**Now you can:**
- Deploy smart contract to Sepolia
- Test hackathon creation
- Submit projects
- Distribute prizes

**Continue with:**
- `LOCAL-DEV-WITH-SEPOLIA.md` (deployment guide)
- `TESTING-GUIDE-BLOCKCHAIN.md` (full testing workflow)

🚀 **You're ready to start blockchain development!**
