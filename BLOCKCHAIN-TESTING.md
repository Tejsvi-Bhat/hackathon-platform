# Blockchain Mode Testing Guide

## ✅ What's Implemented:

### 1. Wallet-Based Authentication
- **No more email/password in blockchain mode**
- Connect MetaMask → Select Role (Organizer/Participant/Judge) → Sign message
- Stores wallet address + role locally

### 2. Smart Contract Data Fetching
- **Hackathons fetched from Sepolia contract** (not database)
- Real-time blockchain data display
- Shows: Name, Description, Prize Pool in HC, Project Count

## 🚀 How to Test:

### Step 1: Enable Blockchain Mode
1. Open http://localhost:3000
2. Click "Blockchain Mode" toggle in sidebar (turns blue with gradient)
3. Ensure you're on Sepolia testnet in MetaMask

### Step 2: Authenticate with Wallet
1. Click "Connect MetaMask" in top nav OR "Login" button
2. Approve MetaMask connection
3. Select your role:
   - **Organizer**: Create hackathons
   - **Participant**: Submit projects
   - **Judge**: Review projects
4. Sign the authentication message in MetaMask
5. You're logged in! See wallet address in top nav

### Step 3: View Blockchain Hackathons
1. Homepage now shows hackathons from smart contract
2. Each card displays:
   - Hackathon ID (from blockchain)
   - Name & Description
   - Prize Pool in HackerCoins
   - Number of submitted projects
   - Status (active/completed)

### Step 4: Compare Modes
**Toggle OFF blockchain mode:**
- See database hackathons
- Email/password login
- Traditional data

**Toggle ON blockchain mode:**
- See smart contract hackathons  
- Wallet authentication
- Blockchain data

## 📊 What You'll See:

### In Database Mode:
```
Homepage: Shows all DB hackathons
Login: Email/password modal
User: Traditional user profile
```

### In Blockchain Mode:
```
Homepage: Shows contract hackathons (might be empty initially)
Login: Wallet signature modal with role selection
User: Wallet address + role
Top Nav: "Balance: 500,000 HC | Wallet: 0xf39F...2266"
```

## 🎯 Key Differences:

| Feature | Database Mode | Blockchain Mode |
|---------|--------------|-----------------|
| Auth | Email/Password | Wallet Signature |
| Data Source | PostgreSQL | Sepolia Contract |
| User ID | Email | Wallet Address |
| Hackathons | DB records | Smart contract events |
| Create Cost | Free | 100 HC + prizes + judge fees |
| Submit Cost | Free | 1 HC |

## 💡 Tips:

1. **No Hackathons Showing?**
   - Normal! Contract might be empty
   - Create one via contract (future step)
   - Or switch to database mode to see sample data

2. **Need Test ETH?**
   - Visit https://sepoliafaucet.com
   - Get 0.5 ETH = 500,000 HC free
   - One account can test everything

3. **Switch Roles?**
   - Logout (disconnect wallet)
   - Login again
   - Select different role

4. **Check Contract:**
   - View on Etherscan: https://sepolia.etherscan.io/address/0x47252B2ed1f17Edc0E527e96f2b2C2088a93AD2A
   - See all transactions and state

## 🐛 Known Limitations (To Be Implemented):

- [ ] Create Hackathon from UI (currently shows DB hackathons if empty)
- [ ] Submit Project with blockchain transaction
- [ ] Prize distribution UI
- [ ] Real-time updates when new hackathons are created
- [ ] Better error handling for contract failures

## 📝 Quick Test Checklist:

- [ ] Toggle blockchain mode ON
- [ ] Click "Login" → Connect MetaMask
- [ ] Select a role → Sign message
- [ ] See wallet address in top nav
- [ ] See balance in HackerCoins
- [ ] Homepage shows blockchain hackathons (or empty)
- [ ] Toggle mode OFF → See database hackathons
- [ ] Toggle mode ON again → Back to blockchain data
- [ ] Logout → Disconnects wallet and clears auth

## 🎉 Success Criteria:

You know it's working when:
1. ✅ Sidebar toggle is blue and animated
2. ✅ Top nav shows wallet balance "500,000 HC"
3. ✅ Login opens wallet auth modal (not email/password)
4. ✅ After auth, user profile shows wallet address
5. ✅ Homepage data changes when you toggle modes
6. ✅ No database errors in blockchain mode

**Everything is now mode-aware!** 🚀
