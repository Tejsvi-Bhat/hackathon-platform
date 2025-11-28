# Judge Incentive Model - Economic Design

## Problem with Current Model
❌ Judges pay gas fees to submit scores  
❌ No incentive to judge fairly  
❌ Judges might not participate if it costs them money  

## ✅ New Model: Judge Staking & Rewards

---

## Model 1: Judge Fee Pool (Simplest)

### How It Works:
```
Hackathon Prize Pool: $10,000
├─ Winners: $9,000 (90%)
└─ Judge Pool: $1,000 (10%)
   └─ Split equally among all judges
```

### Example with 5 Judges:
```
Total Prize: 1.0 ETH
- Winners get: 0.90 ETH
- Judge pool: 0.10 ETH
  ├─ Judge 1: 0.02 ETH
  ├─ Judge 2: 0.02 ETH
  ├─ Judge 3: 0.02 ETH
  ├─ Judge 4: 0.02 ETH
  └─ Judge 5: 0.02 ETH

Each judge:
- Pays gas: 0.0003 ETH ($0.50)
- Gets paid: 0.02 ETH ($50)
- Net profit: +0.0197 ETH ($49.50) ✅
```

### Smart Contract Changes:
```solidity
function createHackathon(
    string memory name,
    uint256 prizePool,
    uint256 judgePoolPercentage  // e.g., 10 means 10%
) payable {
    require(msg.value == prizePool, "Must send full prize pool");
    
    hackathons[hackathonId].prizePool = prizePool * 90 / 100;
    hackathons[hackathonId].judgePool = prizePool * 10 / 100;
}

function distributePrizes(uint256 hackathonId) {
    // 1. Pay winners
    payWinners();
    
    // 2. Pay judges equally
    uint256 judgeCount = hackathonJudges[hackathonId].length;
    uint256 paymentPerJudge = judgePool / judgeCount;
    
    for (uint i = 0; i < judgeCount; i++) {
        judges[i].transfer(paymentPerJudge);
    }
}
```

---

## Model 2: Stake + Reward (More Sophisticated)

### How It Works:
Judges **stake ETH** to participate, get it back + bonus if they judge fairly.

### Example:
```
Judge Stakes: 0.05 ETH (refundable security deposit)

IF judge completes all reviews on time:
- Get stake back: 0.05 ETH
- Get reward: 0.02 ETH
- Total return: 0.07 ETH
- Net profit: +0.02 ETH ✅

IF judge doesn't complete reviews:
- Lose stake: -0.05 ETH (goes to active judges)
- Net loss: -0.05 ETH ❌
```

### Smart Contract:
```solidity
mapping(uint256 => mapping(address => uint256)) public judgeStakes;

function stakeAsJudge(uint256 hackathonId) payable {
    require(msg.value >= MINIMUM_STAKE, "Must stake minimum");
    judgeStakes[hackathonId][msg.sender] = msg.value;
    hackathonJudges[hackathonId].push(msg.sender);
}

function distributePrizes(uint256 hackathonId) {
    // Calculate who completed their reviews
    address[] memory activeJudges = getActiveJudges(hackathonId);
    address[] memory inactiveJudges = getInactiveJudges(hackathonId);
    
    // Slash inactive judges (their stake goes to active judges)
    uint256 slashedAmount = 0;
    for (uint i = 0; i < inactiveJudges.length; i++) {
        slashedAmount += judgeStakes[hackathonId][inactiveJudges[i]];
    }
    
    // Pay active judges: stake + reward + share of slashed
    uint256 totalJudgeReward = judgePool + slashedAmount;
    uint256 rewardPerJudge = totalJudgeReward / activeJudges.length;
    
    for (uint i = 0; i < activeJudges.length; i++) {
        address judge = activeJudges[i];
        uint256 stake = judgeStakes[hackathonId][judge];
        judge.transfer(stake + rewardPerJudge);  // Return stake + reward
    }
}
```

---

## Model 3: Quadratic Funding (Most Fair)

### How It Works:
Judges who review MORE projects get proportionally MORE rewards.

### Example:
```
3 Judges reviewing 10 projects:
- Judge A reviews: 10 projects (100%)
- Judge B reviews: 8 projects (80%)
- Judge C reviews: 5 projects (50%)

Judge Pool: 0.10 ETH

Distribution:
- Judge A: 0.10 × (10/23) = 0.0435 ETH
- Judge B: 0.10 × (8/23) = 0.0348 ETH
- Judge C: 0.10 × (5/23) = 0.0217 ETH
```

---

## Model 4: Gasless Judging + Meta-Transactions (Best UX)

### How It Works:
Judges don't pay ANY gas - organizer pays or uses relayer.

### Technical Implementation:
```typescript
// Backend acts as relayer
app.post('/api/projects/:id/score', async (req, res) => {
  const { technicalScore, innovationScore, ... } = req.body;
  
  // Judge signs message (FREE for judge)
  const signature = req.body.signature;
  
  // Backend submits to blockchain (organizer pays gas)
  const tx = await contract.submitScoreOnBehalf(
    judgeAddress,
    projectId,
    scores,
    signature,
    { from: organizerWallet }  // Organizer pays gas!
  );
  
  await tx.wait();
  res.json({ success: true });
});
```

### Smart Contract (EIP-2771 Meta-Transactions):
```solidity
function submitScoreOnBehalf(
    address judge,
    uint256 projectId,
    uint256[] scores,
    bytes signature
) external {
    // Verify judge signed this
    require(verifySignature(judge, projectId, scores, signature), "Invalid signature");
    
    // Record score (msg.sender is relayer, but we use judge address)
    _submitScore(judge, projectId, scores);
}
```

**Benefits:**
- ✅ Judge pays ZERO gas
- ✅ Judge still gets paid from judge pool
- ✅ Organizer covers all costs
- ✅ Better UX - no MetaMask popups for every score

---

## Recommended Model: Hybrid Approach

### Combine Model 1 + Model 4

```
Prize Pool: 1.0 ETH
├─ Winners: 0.85 ETH (85%)
├─ Judge Pool: 0.10 ETH (10%)
└─ Platform Fee: 0.05 ETH (5%) - covers gas for all transactions
```

### Flow:
1. **Organizer deposits** 1.0 ETH when creating hackathon
2. **Judges submit scores** - gasless (platform pays from its 5% fee)
3. **Winners announced** - platform pays gas from fee pool
4. **Judge rewards distributed** - 0.10 ETH split equally among judges
5. **Platform keeps remainder** - leftover from 5% fee after covering gas

### Economics:
```
For Organizer:
- Deposits: 1.0 ETH
- Winners get: 0.85 ETH
- Judges get: 0.10 ETH
- Platform: 0.05 ETH
- Total: 1.0 ETH ✅ (transparent breakdown)

For Each Judge (assuming 5 judges):
- Pays gas: 0 ETH (gasless!)
- Gets paid: 0.02 ETH ($50)
- Net profit: +0.02 ETH ✅

For Platform:
- Receives: 0.05 ETH per hackathon
- Spends on gas:
  * 5 judge scores × 0.0003 = 0.0015 ETH
  * Prize distribution: 0.0005 ETH
  * Total gas: 0.002 ETH
- Net revenue: 0.048 ETH ($120) per hackathon ✅
```

---

## Implementation Plan

### Phase 1: Update Smart Contract
```solidity
struct Hackathon {
    uint256 prizePool;
    uint256 judgePool;      // NEW: separate pool for judges
    uint256 platformFee;    // NEW: covers gas costs
    // ...
}

function createHackathon(...) payable {
    require(msg.value > 0, "Must deposit prize pool");
    
    uint256 judgePoolAmount = msg.value * 10 / 100;     // 10%
    uint256 platformFeeAmount = msg.value * 5 / 100;    // 5%
    uint256 prizePoolAmount = msg.value - judgePoolAmount - platformFeeAmount;
    
    hackathons[id] = Hackathon({
        prizePool: prizePoolAmount,
        judgePool: judgePoolAmount,
        platformFee: platformFeeAmount,
        ...
    });
}

function distributePrizes(uint256 hackathonId) {
    Hackathon storage h = hackathons[hackathonId];
    
    // 1. Pay winners
    _distributeWinnerPrizes(h);
    
    // 2. Pay judges equally
    address[] memory judges = getActiveJudges(hackathonId);
    uint256 rewardPerJudge = h.judgePool / judges.length;
    
    for (uint i = 0; i < judges.length; i++) {
        payable(judges[i]).transfer(rewardPerJudge);
        emit JudgePaid(hackathonId, judges[i], rewardPerJudge);
    }
    
    // 3. Platform fee stays in contract (withdrawn separately)
}
```

### Phase 2: Backend Relayer Service
```typescript
// server/blockchain-relayer.ts
import { ethers } from 'ethers';

const relayerWallet = new ethers.Wallet(
  process.env.RELAYER_PRIVATE_KEY,
  provider
);

export async function submitScoreGasless(
  judgeAddress: string,
  projectId: number,
  scores: number[],
  judgeSignature: string
) {
  // Relayer pays gas, judge gets credit for score
  const tx = await contract.connect(relayerWallet).submitScoreOnBehalf(
    judgeAddress,
    projectId,
    scores,
    judgeSignature
  );
  
  return await tx.wait();
}
```

### Phase 3: Frontend Changes
```typescript
// app/projects/[id]/page.tsx
const handleSubmitScore = async () => {
  // 1. Judge signs message (FREE)
  const message = `Score project ${projectId}: [${scores.join(',')}]`;
  const signature = await signer.signMessage(message);
  
  // 2. Send to backend (backend pays gas)
  const res = await fetch('/api/projects/:id/score', {
    method: 'POST',
    body: JSON.stringify({ scores, signature })
  });
  
  // 3. Show success - judge paid nothing!
  alert('Score submitted! You will receive 0.02 ETH when winners are announced.');
};
```

---

## Updated User Journey

### Judge Sarah's Experience:

**Before (Paid Gas):**
```
Balance: 0.08 ETH
Submit 10 scores: -0.003 ETH
Final: 0.077 ETH
Net: -0.003 ETH ❌
```

**After (Gets Paid):**
```
Balance: 0.08 ETH
Submit 10 scores: FREE (gasless!)
Hackathon ends: +0.02 ETH (judge reward)
Final: 0.10 ETH
Net: +0.02 ETH ✅
```

### Participant Alice's Experience:
```
Balance: 0.1 ETH
Submit project: FREE (platform pays gas)
Wins 1st place: +0.425 ETH (85% of 0.5 ETH = 0.425 ETH)
Final: 0.525 ETH
Net: +0.425 ETH ✅
```

---

## Summary Table

| Party | Old Model | New Model |
|-------|-----------|-----------|
| **Judge** | Pays 0.003 ETH ❌ | Gets 0.02 ETH ✅ |
| **Winner** | Gets 0.5 ETH | Gets 0.425 ETH |
| **Organizer** | Pays 1.0 ETH | Pays 1.0 ETH |
| **Platform** | $0 | Gets 0.05 ETH |

**Everyone Benefits:**
- ✅ Judges incentivized with real rewards
- ✅ Winners still get majority (85%)
- ✅ Organizer has transparent fee structure
- ✅ Platform sustainable (covers gas + profit)
- ✅ NO ONE pays gas out of pocket
