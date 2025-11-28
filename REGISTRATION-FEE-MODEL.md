# Registration Fee Model - Organizer Benefits

## Concept: Flexible Registration Fee (0 to 0.001 ETH)

When creating a hackathon, organizers can set a registration fee between **0 ETH (free)** and **0.001 ETH ($2.50)** per participant.

---

## Economic Models

### Model A: Free Registration (0 ETH)
```
Registration Fee: FREE
Organizer Benefit: More participants, higher visibility
Use Case: Community hackathons, educational events
```

### Model B: Small Fee (0.0005 ETH = $1.25)
```
Registration Fee: 0.0005 ETH
With 50 participants: 0.025 ETH revenue ($62.50)
Use Case: Cover costs, prevent no-shows
```

### Model C: Maximum Fee (0.001 ETH = $2.50)
```
Registration Fee: 0.001 ETH
With 50 participants: 0.05 ETH revenue ($125)
Use Case: Premium hackathons, serious participants only
```

---

## Complete Prize Pool Breakdown

### Example: 1.0 ETH Prize Pool + 0.001 ETH Registration (50 participants)

**Organizer Deposits:**
```
Prize Pool: 1.0 ETH (locked in smart contract)
```

**Organizer Receives (from registrations):**
```
50 participants × 0.001 ETH = 0.05 ETH ($125)
└─ Organizer keeps 100% of registration fees!
```

**Prize Distribution (from 1.0 ETH pool):**
```
Total: 1.0 ETH
├─ Winners (85%): 0.85 ETH
│   ├─ 1st: 0.425 ETH
│   ├─ 2nd: 0.255 ETH
│   └─ 3rd: 0.170 ETH
├─ Judges (10%): 0.10 ETH (3 judges = 0.0333 ETH each)
└─ Platform (5%): 0.05 ETH
```

**Organizer Total Benefit:**
```
Spent: 1.0 ETH (prize pool)
Received: 0.05 ETH (registrations)
Net Cost: 0.95 ETH
Discount: 5% (compared to free registration)
```

---

## Smart Contract Implementation

### Create Hackathon with Registration Fee

```solidity
struct Hackathon {
    string name;
    uint256 prizePool;
    uint256 registrationFee;  // NEW: 0 to 0.001 ETH
    uint256 winnerPool;       // 85%
    uint256 judgePool;        // 10%
    uint256 platformFee;      // 5%
    address organizer;
    mapping(address => bool) registeredParticipants;
    uint256 registrationCount;
}

function createHackathon(
    string memory name,
    uint256 registrationFee,  // NEW parameter
    address[] memory judges
) payable {
    require(registrationFee <= 0.001 ether, "Max registration fee is 0.001 ETH");
    require(msg.value > 0, "Must deposit prize pool");
    
    uint256 winnerPool = msg.value * 85 / 100;
    uint256 judgePool = msg.value * 10 / 100;
    uint256 platformFee = msg.value * 5 / 100;
    
    hackathons[nextHackathonId] = Hackathon({
        name: name,
        prizePool: msg.value,
        registrationFee: registrationFee,  // Organizer sets this
        winnerPool: winnerPool,
        judgePool: judgePool,
        platformFee: platformFee,
        organizer: msg.sender,
        registrationCount: 0
    });
    
    emit HackathonCreated(nextHackathonId, name, msg.value, registrationFee);
}
```

### Participant Registration

```solidity
function registerForHackathon(uint256 hackathonId) payable {
    Hackathon storage h = hackathons[hackathonId];
    
    require(!h.registeredParticipants[msg.sender], "Already registered");
    require(msg.value == h.registrationFee, "Incorrect registration fee");
    
    // Transfer registration fee directly to organizer
    payable(h.organizer).transfer(msg.value);
    
    h.registeredParticipants[msg.sender] = true;
    h.registrationCount++;
    
    emit ParticipantRegistered(hackathonId, msg.sender, msg.value);
}

function isRegistered(uint256 hackathonId, address participant) 
    public view returns (bool) {
    return hackathons[hackathonId].registeredParticipants[participant];
}
```

---

## Backend Integration

### Create Hackathon Endpoint (Updated)

```typescript
// server/index.ts
app.post('/api/hackathons', async (req, res) => {
  const { 
    title, 
    description, 
    registrationFee  // NEW: 0 to 0.001
  } = req.body;
  
  // Validate registration fee
  if (registrationFee < 0 || registrationFee > 0.001) {
    return res.status(400).json({ 
      error: 'Registration fee must be between 0 and 0.001 ETH' 
    });
  }
  
  // Save to database
  const result = await pool.query(
    `INSERT INTO hackathons (
      title, description, organizer_id, registration_fee, created_at
    ) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [title, description, organizerId, registrationFee]
  );
  
  const hackathonId = result.rows[0].id;
  
  // Deploy to blockchain
  const tx = await contract.createHackathon(
    title,
    ethers.utils.parseEther(registrationFee.toString()),
    judgeAddresses,
    { value: ethers.utils.parseEther(prizePool.toString()) }
  );
  
  await tx.wait();
  
  res.json({ success: true, hackathonId });
});
```

### Registration Endpoint (NEW)

```typescript
app.post('/api/hackathons/:id/register', async (req, res) => {
  const hackathonId = req.params.id;
  const userId = req.user.id;
  const walletAddress = req.user.wallet_address;
  
  // Check if already registered
  const existing = await pool.query(
    'SELECT * FROM hackathon_registrations WHERE hackathon_id = $1 AND user_id = $2',
    [hackathonId, userId]
  );
  
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Already registered' });
  }
  
  // Get hackathon registration fee
  const hackathon = await pool.query(
    'SELECT registration_fee, blockchain_id FROM hackathons WHERE id = $1',
    [hackathonId]
  );
  
  const registrationFee = hackathon.rows[0].registration_fee;
  
  // User must sign transaction with their wallet
  // Frontend handles MetaMask call, backend verifies
  
  // Save registration to database
  await pool.query(
    `INSERT INTO hackathon_registrations (
      hackathon_id, user_id, registration_fee_paid, registered_at
    ) VALUES ($1, $2, $3, NOW())`,
    [hackathonId, userId, registrationFee]
  );
  
  res.json({ 
    success: true, 
    message: `Registered! Fee: ${registrationFee} ETH` 
  });
});
```

---

## Frontend UI Changes

### Hackathon Creation Form

```typescript
// app/create-hackathon/page.tsx

const [registrationFee, setRegistrationFee] = useState(0);

<div className="space-y-4">
  <label>Registration Fee (Optional)</label>
  <input 
    type="range"
    min="0"
    max="0.001"
    step="0.0001"
    value={registrationFee}
    onChange={(e) => setRegistrationFee(parseFloat(e.target.value))}
  />
  
  <div className="flex justify-between text-sm">
    <span>Free (0 ETH)</span>
    <span className="font-bold">
      {registrationFee.toFixed(4)} ETH
      {registrationFee > 0 && (
        <span className="text-gray-400 ml-2">
          (${(registrationFee * 2500).toFixed(2)})
        </span>
      )}
    </span>
    <span>Max (0.001 ETH)</span>
  </div>
  
  {registrationFee > 0 && (
    <div className="bg-blue-50 p-3 rounded">
      <p className="text-sm">
        💰 With 50 participants, you'll receive:{' '}
        <span className="font-bold">
          {(registrationFee * 50).toFixed(4)} ETH
          (${(registrationFee * 50 * 2500).toFixed(2)})
        </span>
      </p>
      <p className="text-xs text-gray-600 mt-1">
        Registration fees go directly to you (100%)
      </p>
    </div>
  )}
</div>
```

### Hackathon Detail Page (Registration Button)

```typescript
// app/hackathons/[id]/page.tsx

const handleRegister = async () => {
  if (!walletAddress) {
    alert('Please connect your wallet first');
    return;
  }
  
  if (registrationFee === 0) {
    // Free registration - just database entry
    await fetch(`/api/hackathons/${id}/register`, {
      method: 'POST'
    });
    alert('Registered successfully!');
  } else {
    // Paid registration - MetaMask transaction
    try {
      const tx = await contract.registerForHackathon(blockchainId, {
        value: ethers.utils.parseEther(registrationFee.toString())
      });
      
      await tx.wait();
      
      // Save to database
      await fetch(`/api/hackathons/${id}/register`, {
        method: 'POST',
        body: JSON.stringify({ txHash: tx.hash })
      });
      
      alert(`Registered! Paid ${registrationFee} ETH`);
    } catch (error) {
      alert('Registration failed. Make sure you have enough ETH.');
    }
  }
};

<button onClick={handleRegister}>
  {registrationFee === 0 ? 'Register (FREE)' : `Register (${registrationFee} ETH)`}
</button>
```

---

## Revenue Scenarios

### Scenario 1: Community Hackathon (Free)
```
Registration Fee: 0 ETH
Participants: 100
Organizer Revenue: $0
Organizer Benefit: High participation, community goodwill
```

### Scenario 2: Moderate Fee Hackathon
```
Registration Fee: 0.0005 ETH ($1.25)
Participants: 50
Organizer Revenue: 0.025 ETH ($62.50)
Organizer Benefit: Covers marketing costs, reduces no-shows
```

### Scenario 3: Premium Hackathon
```
Registration Fee: 0.001 ETH ($2.50)
Participants: 30 (serious builders only)
Organizer Revenue: 0.03 ETH ($75)
Organizer Benefit: Serious participants, quality over quantity
```

### Scenario 4: Large Scale Event
```
Registration Fee: 0.0005 ETH ($1.25)
Participants: 200
Organizer Revenue: 0.1 ETH ($250)
Organizer Benefit: Significant revenue, covers venue costs
```

---

## Benefits for Each Party

### For Organizers:
✅ Flexible pricing (0 to 0.001 ETH)  
✅ Direct revenue (100% of registration fees)  
✅ Reduce no-shows (skin in the game)  
✅ Cover operational costs  
✅ Scale revenue with participation  

### For Participants:
✅ Low barrier to entry ($0-$2.50)  
✅ Transparent pricing (on-chain)  
✅ Refundable if hackathon cancelled  
✅ Proves commitment (for paid events)  

### For Platform:
✅ Attracts organizers (revenue opportunity)  
✅ Higher quality events (serious participants)  
✅ Still earns 5% from prize pool  

---

## Database Schema Updates

```sql
-- Add registration_fee column to hackathons
ALTER TABLE hackathons 
ADD COLUMN registration_fee DECIMAL(10, 6) DEFAULT 0 
CHECK (registration_fee >= 0 AND registration_fee <= 0.001);

-- Create registrations table
CREATE TABLE hackathon_registrations (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id),
    user_id INTEGER REFERENCES users(id),
    registration_fee_paid DECIMAL(10, 6) NOT NULL,
    transaction_hash VARCHAR(66),
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- Index for quick lookups
CREATE INDEX idx_registrations_hackathon 
ON hackathon_registrations(hackathon_id);

CREATE INDEX idx_registrations_user 
ON hackathon_registrations(user_id);
```

---

## Complete Economic Example

### Hackathon: "AI Innovation Challenge"

**Organizer Setup:**
```
Prize Pool Deposit: 2.0 ETH
Registration Fee: 0.001 ETH
Expected Participants: 80
```

**Organizer Costs:**
```
Prize Pool: 2.0 ETH
Total Cost: 2.0 ETH
```

**Organizer Revenue:**
```
80 participants × 0.001 ETH = 0.08 ETH ($200)
Revenue: 0.08 ETH
```

**Prize Distribution (from 2.0 ETH):**
```
Winners (85%): 1.70 ETH
├─ 1st: 0.85 ETH ($2,125)
├─ 2nd: 0.51 ETH ($1,275)
└─ 3rd: 0.34 ETH ($850)

Judges (10%): 0.20 ETH
└─ 5 judges × 0.04 ETH = $100 each

Platform (5%): 0.10 ETH ($250)
```

**Organizer Net:**
```
Spent: 2.0 ETH
Earned: 0.08 ETH (from registrations)
Net Cost: 1.92 ETH
Effective Discount: 4%
```

**Winner Alice:**
```
Paid Registration: 0.001 ETH ($2.50)
Won 1st Place: 0.85 ETH ($2,125)
Net Profit: 0.849 ETH ($2,122.50)
ROI: 84,900%
```

**Judge Sarah:**
```
Paid Registration: N/A (judges don't pay)
Earned: 0.04 ETH ($100)
Time: 3 hours
Hourly Rate: $33.33/hour
```

---

## Refund Policy (Optional Feature)

### Auto-Refund if Hackathon Cancelled

```solidity
function cancelHackathon(uint256 hackathonId) {
    require(msg.sender == hackathons[hackathonId].organizer, "Not organizer");
    require(!hackathons[hackathonId].started, "Already started");
    
    Hackathon storage h = hackathons[hackathonId];
    
    // Refund all registration fees
    for (uint i = 0; i < h.participants.length; i++) {
        address participant = h.participants[i];
        payable(participant).transfer(h.registrationFee);
    }
    
    // Return prize pool to organizer
    payable(h.organizer).transfer(h.prizePool);
    
    emit HackathonCancelled(hackathonId);
}
```

---

## Recommended Default Settings

### For Most Hackathons:
```
Registration Fee: 0.0005 ETH ($1.25)
Reason: Low barrier, reduces no-shows, generates some revenue
```

### For Community Events:
```
Registration Fee: 0 ETH (FREE)
Reason: Maximum participation, community building
```

### For Corporate/Premium:
```
Registration Fee: 0.001 ETH ($2.50)
Reason: Serious participants only, quality over quantity
```

---

## Summary

**Organizer Benefits:**
- 💰 Earn 100% of registration fees (0 to 0.001 ETH per participant)
- 📊 With 50 participants at 0.001 ETH = $125 revenue
- 🎯 Reduce no-shows (committed participants)
- ⚖️ Flexible pricing based on event type

**Participant Perspective:**
- ✅ Low cost ($0-$2.50 to enter)
- ✅ Transparent (fees shown upfront)
- ✅ Refundable if cancelled
- ✅ Serious events filter out non-committed people

**Everyone Wins:**
- Organizers offset costs
- Participants stay committed
- Platform grows with quality events
- Economic sustainability achieved! 🚀
