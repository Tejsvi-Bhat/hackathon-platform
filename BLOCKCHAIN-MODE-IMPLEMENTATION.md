# Feature Flag: Blockchain Mode Implementation

## Overview

A toggle-based feature flag system that switches between:
- **Database Mode** (default): Traditional PostgreSQL backend
- **Blockchain Mode**: Smart contracts with MetaMask authentication

---

## Currency: HackerCoins

```
1 HackerCoin = 0.000001 ETH = 1,000,000 wei
1 ETH = 1,000,000 HackerCoins

Examples:
- 100 HackerCoins = 0.0001 ETH ($0.25)
- 1,000 HackerCoins = 0.001 ETH ($2.50)
- 10,000 HackerCoins = 0.01 ETH ($25)

Network: Sepolia Testnet
Faucet: https://sepoliafaucet.com (get 0.5 ETH = 500,000 HackerCoins)
```

---

## Economic Model

### Organizer Costs:
```
Create Hackathon: 100 HackerCoins (0.0001 ETH)
+ Prize Pool: Variable (e.g., 10,000 HackerCoins)
+ Judge Fees: 5 HackerCoins per judge

Example:
- Base fee: 100 HC
- Prize pool: 10,000 HC
- 5 judges × 5 HC = 25 HC
- Total: 10,125 HC (0.010125 ETH)
```

### Participant Costs:
```
Registration: FREE
Project Submission: 1 HackerCoin (0.000001 ETH)

Distribution:
- 20% to Organizer: 0.2 HC
- 80% to Judges: 0.8 HC (split equally)
```

### Judge Earnings:
```
Base Payment: 5 HackerCoins (when added to hackathon)
Per Submission: 80% of 1 HC = 0.8 HC (split among all judges)

Example with 50 submissions, 5 judges:
- Base: 5 HC
- Submissions: 50 × 0.8 HC / 5 judges = 8 HC
- Total: 13 HC per judge
```

---

## Smart Contract Design

### HackerCoinPlatform.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HackerCoinPlatform {
    // Constants
    uint256 constant HACKERCOIN = 1_000_000; // 1 HC = 0.000001 ETH
    uint256 constant HACKATHON_CREATION_FEE = 100 * HACKERCOIN;
    uint256 constant JUDGE_BASE_FEE = 5 * HACKERCOIN;
    uint256 constant SUBMISSION_FEE = 1 * HACKERCOIN;
    uint256 constant ORGANIZER_SHARE = 20; // 20%
    uint256 constant JUDGE_SHARE = 80; // 80%
    
    struct Hackathon {
        uint256 id;
        string name;
        string description;
        address organizer;
        uint256 prizePool;
        uint256 creationTimestamp;
        address[] judges;
        uint256 judgePoolBalance;
        uint256 organizerBalance;
        bool active;
        mapping(address => bool) isJudge;
        mapping(uint256 => Project) projects;
        uint256 projectCount;
    }
    
    struct Project {
        uint256 id;
        string name;
        string description;
        address participant;
        uint256 submissionTimestamp;
        bool exists;
    }
    
    struct Prize {
        string title;
        uint256 amount;
        uint256 position;
    }
    
    // State
    mapping(uint256 => Hackathon) public hackathons;
    uint256 public hackathonCount;
    
    mapping(address => uint256) public balances; // Platform balances (fees collected)
    
    // Events
    event HackathonCreated(
        uint256 indexed hackathonId, 
        address indexed organizer, 
        string name, 
        uint256 prizePool,
        uint256 creationFee
    );
    
    event JudgeAdded(
        uint256 indexed hackathonId, 
        address indexed judge, 
        uint256 baseFee
    );
    
    event ProjectSubmitted(
        uint256 indexed hackathonId, 
        uint256 indexed projectId, 
        address indexed participant,
        uint256 submissionFee
    );
    
    event PrizeDistributed(
        uint256 indexed hackathonId,
        address indexed winner,
        uint256 amount
    );
    
    // Functions
    
    /// @notice Create a new hackathon
    /// @param name Hackathon name
    /// @param description Hackathon description
    /// @param judges Array of judge addresses
    /// @param prizes Array of prize structures
    function createHackathon(
        string memory name,
        string memory description,
        address[] memory judges,
        Prize[] memory prizes
    ) external payable {
        // Calculate required payment
        uint256 totalPrizePool = 0;
        for (uint i = 0; i < prizes.length; i++) {
            totalPrizePool += prizes[i].amount * HACKERCOIN;
        }
        
        uint256 judgesFee = judges.length * JUDGE_BASE_FEE;
        uint256 requiredAmount = HACKATHON_CREATION_FEE + totalPrizePool + judgesFee;
        
        require(msg.value >= requiredAmount, "Insufficient payment");
        
        // Create hackathon
        hackathonCount++;
        Hackathon storage h = hackathons[hackathonCount];
        h.id = hackathonCount;
        h.name = name;
        h.description = description;
        h.organizer = msg.sender;
        h.prizePool = totalPrizePool;
        h.creationTimestamp = block.timestamp;
        h.active = true;
        h.judgePoolBalance = 0;
        h.organizerBalance = 0;
        
        // Add judges and pay base fee
        for (uint i = 0; i < judges.length; i++) {
            h.judges.push(judges[i]);
            h.isJudge[judges[i]] = true;
            
            // Pay judge base fee immediately
            payable(judges[i]).transfer(JUDGE_BASE_FEE);
            
            emit JudgeAdded(hackathonCount, judges[i], JUDGE_BASE_FEE);
        }
        
        // Platform keeps creation fee
        balances[address(this)] += HACKATHON_CREATION_FEE;
        
        emit HackathonCreated(
            hackathonCount, 
            msg.sender, 
            name, 
            totalPrizePool,
            HACKATHON_CREATION_FEE
        );
    }
    
    /// @notice Submit a project to a hackathon
    /// @param hackathonId The hackathon ID
    /// @param projectName Project name
    /// @param projectDescription Project description
    function submitProject(
        uint256 hackathonId,
        string memory projectName,
        string memory projectDescription
    ) external payable {
        require(msg.value >= SUBMISSION_FEE, "Insufficient submission fee");
        require(hackathons[hackathonId].active, "Hackathon not active");
        
        Hackathon storage h = hackathons[hackathonId];
        
        // Create project
        h.projectCount++;
        Project storage p = h.projects[h.projectCount];
        p.id = h.projectCount;
        p.name = projectName;
        p.description = projectDescription;
        p.participant = msg.sender;
        p.submissionTimestamp = block.timestamp;
        p.exists = true;
        
        // Distribute submission fee
        uint256 organizerAmount = (SUBMISSION_FEE * ORGANIZER_SHARE) / 100;
        uint256 judgeAmount = (SUBMISSION_FEE * JUDGE_SHARE) / 100;
        
        h.organizerBalance += organizerAmount;
        h.judgePoolBalance += judgeAmount;
        
        emit ProjectSubmitted(hackathonId, h.projectCount, msg.sender, SUBMISSION_FEE);
    }
    
    /// @notice Distribute prizes to winners
    /// @param hackathonId The hackathon ID
    /// @param winners Array of winner addresses
    /// @param amounts Array of prize amounts (in HackerCoins)
    function distributePrizes(
        uint256 hackathonId,
        address[] memory winners,
        uint256[] memory amounts
    ) external {
        Hackathon storage h = hackathons[hackathonId];
        require(msg.sender == h.organizer, "Only organizer can distribute prizes");
        require(winners.length == amounts.length, "Array length mismatch");
        
        // Distribute prizes
        for (uint i = 0; i < winners.length; i++) {
            uint256 amount = amounts[i] * HACKERCOIN;
            require(amount <= h.prizePool, "Insufficient prize pool");
            
            h.prizePool -= amount;
            payable(winners[i]).transfer(amount);
            
            emit PrizeDistributed(hackathonId, winners[i], amount);
        }
        
        // Pay judges their share
        uint256 judgePayment = h.judgePoolBalance / h.judges.length;
        for (uint i = 0; i < h.judges.length; i++) {
            payable(h.judges[i]).transfer(judgePayment);
        }
        h.judgePoolBalance = 0;
        
        // Pay organizer their share
        payable(h.organizer).transfer(h.organizerBalance);
        h.organizerBalance = 0;
        
        h.active = false;
    }
    
    /// @notice Get hackathon details
    function getHackathon(uint256 hackathonId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address organizer,
            uint256 prizePool,
            uint256 projectCount,
            bool active
        ) 
    {
        Hackathon storage h = hackathons[hackathonId];
        return (
            h.name,
            h.description,
            h.organizer,
            h.prizePool,
            h.projectCount,
            h.active
        );
    }
    
    /// @notice Convert ETH to HackerCoins for display
    function ethToHackerCoins(uint256 weiAmount) public pure returns (uint256) {
        return weiAmount / HACKERCOIN;
    }
    
    /// @notice Convert HackerCoins to wei for transactions
    function hackerCoinsToWei(uint256 hackerCoins) public pure returns (uint256) {
        return hackerCoins * HACKERCOIN;
    }
}
```

---

## Frontend Implementation

### 1. Context for Blockchain Mode

```typescript
// app/context/BlockchainContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface BlockchainContextType {
  isBlockchainMode: boolean;
  toggleBlockchainMode: () => void;
  walletAddress: string | null;
  balance: string;
  balanceInHC: string;
  connectWallet: () => Promise<void>;
  contract: ethers.Contract | null;
}

const BlockchainContext = createContext<BlockchainContextType>({
  isBlockchainMode: false,
  toggleBlockchainMode: () => {},
  walletAddress: null,
  balance: '0',
  balanceInHC: '0',
  connectWallet: async () => {},
  contract: null
});

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [isBlockchainMode, setIsBlockchainMode] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  
  const HACKERCOIN = 1_000_000; // 1 HC = 0.000001 ETH
  
  // Contract address (deploy and update this)
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  
  const CONTRACT_ABI = [
    // Add full ABI here after deployment
  ];
  
  const toggleBlockchainMode = () => {
    setIsBlockchainMode(!isBlockchainMode);
    if (!isBlockchainMode) {
      connectWallet();
    }
  };
  
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      
      setWalletAddress(accounts[0]);
      
      // Get balance
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.utils.formatEther(bal));
      
      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };
  
  const balanceInHC = (parseFloat(balance) * 1_000_000).toFixed(0);
  
  return (
    <BlockchainContext.Provider
      value={{
        isBlockchainMode,
        toggleBlockchainMode,
        walletAddress,
        balance,
        balanceInHC,
        connectWallet,
        contract
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => useContext(BlockchainContext);
```

### 2. Blockchain Toggle in Sidebar

```typescript
// app/components/Sidebar.tsx - Add this section

import { useBlockchain } from '../context/BlockchainContext';
import { Zap, ZapOff } from 'lucide-react';

export default function Sidebar() {
  const { isBlockchainMode, toggleBlockchainMode } = useBlockchain();
  
  return (
    <aside className="sidebar">
      {/* Existing sidebar content */}
      
      {/* Blockchain Mode Toggle */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="px-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              {isBlockchainMode ? (
                <Zap className="text-yellow-400" size={20} />
              ) : (
                <ZapOff className="text-gray-400" size={20} />
              )}
              <span className="text-sm font-medium">
                Blockchain Mode
              </span>
            </div>
            
            <div className="relative">
              <input
                type="checkbox"
                checked={isBlockchainMode}
                onChange={toggleBlockchainMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
          
          {isBlockchainMode && (
            <p className="text-xs text-gray-400 mt-2">
              Using smart contracts on Sepolia testnet
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
```

### 3. Updated TopNav for Blockchain Mode

```typescript
// app/components/TopNav.tsx - Update wallet display

import { useBlockchain } from '../context/BlockchainContext';

export default function TopNav() {
  const { 
    isBlockchainMode, 
    walletAddress, 
    balanceInHC 
  } = useBlockchain();
  
  if (isBlockchainMode && walletAddress) {
    return (
      <nav className="top-nav">
        {/* Left side - existing content */}
        
        {/* Right side - Blockchain wallet info */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-200">Balance</p>
                <p className="text-lg font-bold text-white">
                  {parseInt(balanceInHC).toLocaleString()} HC
                </p>
                <p className="text-xs text-gray-300">
                  (1 HC = 0.000001 ETH)
                </p>
              </div>
              
              <div className="border-l border-white/30 pl-3">
                <p className="text-xs text-gray-200">Wallet</p>
                <p className="text-sm font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Profile dropdown */}
        </div>
      </nav>
    );
  }
  
  // Regular database mode display
  return (/* existing TopNav */);
}
```

### 4. Create Hackathon with Costs

```typescript
// app/create-hackathon/page.tsx

import { useBlockchain } from '../context/BlockchainContext';
import { Coins } from 'lucide-react';

export default function CreateHackathon() {
  const { isBlockchainMode, contract, balanceInHC } = useBlockchain();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    judges: [],
    prizes: [
      { title: '1st Place', amount: 5000, position: 1 },
      { title: '2nd Place', amount: 3000, position: 2 },
      { title: '3rd Place', amount: 2000, position: 3 }
    ]
  });
  
  // Calculate costs
  const baseFee = 100; // HC
  const totalPrizePool = formData.prizes.reduce((sum, p) => sum + p.amount, 0);
  const judgeFees = formData.judges.length * 5; // 5 HC per judge
  const totalCost = baseFee + totalPrizePool + judgeFees;
  
  const canAfford = parseInt(balanceInHC) >= totalCost;
  
  const handleSubmit = async () => {
    if (!isBlockchainMode) {
      // Regular database mode
      // ... existing implementation
      return;
    }
    
    // Blockchain mode
    try {
      const HACKERCOIN = 1_000_000;
      const valueInWei = totalCost * HACKERCOIN;
      
      const tx = await contract.createHackathon(
        formData.title,
        formData.description,
        formData.judges,
        formData.prizes,
        { value: ethers.BigNumber.from(valueInWei.toString()) }
      );
      
      await tx.wait();
      
      alert('✅ Hackathon created on blockchain!');
      router.push('/hackathons');
      
    } catch (error) {
      console.error('Blockchain creation failed:', error);
      alert('Failed to create hackathon');
    }
  };
  
  return (
    <div className="create-hackathon-page">
      <h1>Create Hackathon</h1>
      
      {/* Form fields */}
      
      {/* Cost Breakdown */}
      {isBlockchainMode && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Coins size={20} />
            Cost Breakdown
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Creation Fee:</span>
              <span className="font-bold">{baseFee} HC</span>
            </div>
            
            <div className="flex justify-between">
              <span>Prize Pool:</span>
              <span className="font-bold">{totalPrizePool} HC</span>
            </div>
            
            <div className="flex justify-between">
              <span>Judge Fees ({formData.judges.length} × 5 HC):</span>
              <span className="font-bold">{judgeFees} HC</span>
            </div>
            
            <div className="border-t border-blue-300 pt-2 flex justify-between text-lg">
              <span className="font-bold">Total Cost:</span>
              <span className="font-bold text-blue-600">{totalCost} HC</span>
            </div>
            
            <p className="text-xs text-gray-600 mt-2">
              ≈ {(totalCost * 0.000001).toFixed(6)} ETH
            </p>
          </div>
          
          {!canAfford && (
            <div className="bg-red-50 border border-red-200 p-3 rounded mt-3">
              <p className="text-sm text-red-700">
                ⚠️ Insufficient balance. You have {balanceInHC} HC but need {totalCost} HC.
              </p>
              <a 
                href="https://sepoliafaucet.com" 
                target="_blank"
                className="text-blue-600 text-sm underline"
              >
                Get testnet ETH from faucet →
              </a>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={isBlockchainMode && !canAfford}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {isBlockchainMode ? (
          <>Create Hackathon ({totalCost} HC)</>
        ) : (
          'Create Hackathon'
        )}
      </button>
    </div>
  );
}
```

### 5. Project Submission with Cost

```typescript
// app/projects/submit/page.tsx

export default function SubmitProject() {
  const { isBlockchainMode, contract, balanceInHC } = useBlockchain();
  const submissionFee = 1; // 1 HC
  
  const handleSubmit = async () => {
    if (!isBlockchainMode) {
      // Database mode
      // ... existing implementation
      return;
    }
    
    // Blockchain mode
    try {
      const HACKERCOIN = 1_000_000;
      const valueInWei = submissionFee * HACKERCOIN;
      
      const tx = await contract.submitProject(
        hackathonId,
        projectName,
        projectDescription,
        { value: ethers.BigNumber.from(valueInWei.toString()) }
      );
      
      await tx.wait();
      
      alert('✅ Project submitted on blockchain!');
      
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };
  
  return (
    <div>
      {/* Form */}
      
      {isBlockchainMode && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
          <p className="text-sm">
            📝 Submission Fee: <span className="font-bold">1 HC</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            • 20% goes to organizer (0.2 HC)
            <br />
            • 80% goes to judges (0.8 HC split)
          </p>
        </div>
      )}
      
      <button onClick={handleSubmit}>
        {isBlockchainMode ? 'Submit Project (1 HC)' : 'Submit Project'}
      </button>
    </div>
  );
}
```

---

## Testing Guide

### Step 1: Local Setup

```bash
# 1. Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Initialize Hardhat
npx hardhat init

# 3. Copy smart contract to contracts/HackerCoinPlatform.sol

# 4. Compile contract
npx hardhat compile

# 5. Start local node
npx hardhat node
```

### Step 2: Deploy Locally

```javascript
// scripts/deploy.js
async function main() {
  const HackerCoinPlatform = await ethers.getContractFactory("HackerCoinPlatform");
  const platform = await HackerCoinPlatform.deploy();
  
  await platform.deployed();
  
  console.log("HackerCoinPlatform deployed to:", platform.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Step 3: Test with Local Accounts

Hardhat gives you 20 test accounts with 10,000 ETH each!

```bash
# Account #0 (Organizer)
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Account #1 (Judge 1)
0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Account #2 (Judge 2)
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

# Account #3 (Participant)
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### Step 4: Connect MetaMask to Local Network

```
Network Name: Localhost 8545
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

Import private keys to MetaMask for testing.

### Step 5: Test Each Role

**Organizer Test:**
```typescript
// In MetaMask: Account #0
// 1. Toggle blockchain mode ON
// 2. Go to Create Hackathon
// 3. Fill form:
//    - Title: "Test Hackathon"
//    - Prize: 10,000 HC
//    - Add 2 judges (Account #1, #2)
// 4. Cost shown: 100 + 10,000 + 10 = 10,110 HC
// 5. Click "Create Hackathon (10,110 HC)"
// 6. Confirm MetaMask transaction
// 7. ✅ Check judges received 5 HC each
```

**Judge Test:**
```typescript
// In MetaMask: Switch to Account #1
// 1. Balance should show 10,000,005 HC (gained 5 HC)
// 2. Wait for project submissions
// 3. After hackathon ends, receive share of submission fees
```

**Participant Test:**
```typescript
// In MetaMask: Switch to Account #3
// 1. Go to hackathon page
// 2. Click "Submit Project"
// 3. Cost shown: 1 HC
// 4. Fill project details
// 5. Click "Submit Project (1 HC)"
// 6. Confirm transaction
// 7. ✅ Project submitted on blockchain
```

---

## Deployment to Sepolia Testnet

### Step 1: Get Sepolia ETH

```
Faucet: https://sepoliafaucet.com
Amount: 0.5 ETH = 500,000 HC
```

### Step 2: Configure Hardhat

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

### Step 3: Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 4: Update Frontend

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (from deployment)
NEXT_PUBLIC_NETWORK=sepolia
```

### Step 5: Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

---

## Testing Checklist

### Database Mode (Default)
- [ ] Toggle is OFF
- [ ] Regular login/signup works
- [ ] PostgreSQL data shows
- [ ] No wallet required
- [ ] Normal buttons (no costs shown)

### Blockchain Mode
- [ ] Toggle is ON
- [ ] MetaMask popup appears
- [ ] Wallet address shown in top nav
- [ ] Balance shown in HackerCoins
- [ ] All costs shown on buttons
- [ ] Smart contract transactions work

### Organizer Flow
- [ ] Create hackathon shows total cost
- [ ] Transaction sends correct amount
- [ ] Judges receive 5 HC immediately
- [ ] Prize pool locked in contract

### Judge Flow
- [ ] Receive 5 HC when added
- [ ] See submission fee share accumulating
- [ ] Get paid when hackathon ends

### Participant Flow
- [ ] Registration is FREE
- [ ] Project submission costs 1 HC
- [ ] 20% goes to organizer
- [ ] 80% goes to judges

---

## Summary

**Currency:** Sepolia ETH → Displayed as HackerCoins (1 HC = 0.000001 ETH)

**Faucet:** https://sepoliafaucet.com (get 0.5 ETH = 500,000 HC)

**Costs:**
- Create Hackathon: 100 HC + Prize Pool + (5 HC × judges)
- Submit Project: 1 HC (0.2 to organizer, 0.8 to judges)
- Registration: FREE

**Testing:**
1. Local: Use Hardhat node with test accounts
2. Testnet: Deploy to Sepolia, use faucet for test ETH

**Feature Flag:**
- Toggle in sidebar (default OFF)
- When ON: MetaMask auth, smart contracts, costs shown
- When OFF: Regular database mode

Ready to implement! 🚀
