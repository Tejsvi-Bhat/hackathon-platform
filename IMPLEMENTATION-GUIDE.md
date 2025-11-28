# Implementation Guide: Registration Fees + Wallet Linking

## Quick Start: Adding Both Features

---

## Part 1: Database Changes

```sql
-- 1. Add registration fee to hackathons
ALTER TABLE hackathons 
ADD COLUMN registration_fee DECIMAL(10, 6) DEFAULT 0 
CHECK (registration_fee >= 0 AND registration_fee <= 0.001);

-- 2. Update users table for wallet linking
ALTER TABLE users 
ADD COLUMN wallet_address VARCHAR(42) UNIQUE,
ADD COLUMN wallet_linked_at TIMESTAMP,
ADD COLUMN wallet_signature VARCHAR(132);

-- 3. Create registrations table
CREATE TABLE hackathon_registrations (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    registration_fee_paid DECIMAL(10, 6) NOT NULL DEFAULT 0,
    transaction_hash VARCHAR(66),
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);

-- 4. Indexes
CREATE INDEX idx_registrations_hackathon ON hackathon_registrations(hackathon_id);
CREATE INDEX idx_registrations_user ON hackathon_registrations(user_id);
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
```

---

## Part 2: Backend API Endpoints

### 1. Link Wallet Endpoint

```typescript
// server/index.ts

import { ethers } from 'ethers';

app.post('/api/users/link-wallet', authenticateToken, async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    const userId = req.user.id;
    
    // Verify signature proves ownership
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Check if wallet already linked to another account
    const existing = await pool.query(
      'SELECT id, email FROM users WHERE wallet_address = $1 AND id != $2',
      [address, userId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Wallet already linked to another account' 
      });
    }
    
    // Link wallet
    await pool.query(
      `UPDATE users 
       SET wallet_address = $1, 
           wallet_signature = $2, 
           wallet_linked_at = NOW() 
       WHERE id = $3`,
      [address, signature, userId]
    );
    
    // Fetch balance
    const balance = await getWalletBalance(address, 'sepolia');
    
    res.json({
      success: true,
      walletAddress: address,
      balance: balance
    });
    
  } catch (error) {
    console.error('Wallet linking error:', error);
    res.status(500).json({ error: 'Failed to link wallet' });
  }
});

// Helper function from lib/web3-client.ts
async function getWalletBalance(address: string, network: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    network === 'sepolia' 
      ? 'https://sepolia.infura.io/v3/...' 
      : 'https://rpc-mumbai.maticvigil.com'
  );
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}
```

### 2. Create Hackathon with Registration Fee

```typescript
// server/index.ts

app.post('/api/hackathons', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      registrationFee  // NEW: 0 to 0.001
    } = req.body;
    
    const organizerId = req.user.id;
    
    // Validate registration fee
    if (registrationFee < 0 || registrationFee > 0.001) {
      return res.status(400).json({
        error: 'Registration fee must be between 0 and 0.001 ETH'
      });
    }
    
    // Insert hackathon with registration fee
    const result = await pool.query(
      `INSERT INTO hackathons (
        title, description, organizer_id, start_date, end_date, 
        registration_fee, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'upcoming', NOW()) 
      RETURNING *`,
      [title, description, organizerId, startDate, endDate, registrationFee]
    );
    
    const hackathon = result.rows[0];
    
    res.json({
      success: true,
      hackathon: hackathon,
      message: registrationFee > 0 
        ? `Hackathon created with ${registrationFee} ETH registration fee` 
        : 'Hackathon created (free registration)'
    });
    
  } catch (error) {
    console.error('Create hackathon error:', error);
    res.status(500).json({ error: 'Failed to create hackathon' });
  }
});
```

### 3. Register for Hackathon

```typescript
// server/index.ts

app.post('/api/hackathons/:id/register', authenticateToken, async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user.id;
    const { transactionHash } = req.body;
    
    // Check if user has wallet linked
    const user = await pool.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [userId]
    );
    
    if (!user.rows[0].wallet_address) {
      return res.status(403).json({
        error: 'Wallet required',
        message: 'Please link your wallet before registering',
        action: 'link_wallet'
      });
    }
    
    // Get hackathon details
    const hackathon = await pool.query(
      'SELECT registration_fee, title FROM hackathons WHERE id = $1',
      [hackathonId]
    );
    
    if (hackathon.rows.length === 0) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }
    
    const registrationFee = parseFloat(hackathon.rows[0].registration_fee);
    
    // Check if already registered
    const existing = await pool.query(
      'SELECT id FROM hackathon_registrations WHERE hackathon_id = $1 AND user_id = $2',
      [hackathonId, userId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered' });
    }
    
    // Save registration
    await pool.query(
      `INSERT INTO hackathon_registrations (
        hackathon_id, user_id, registration_fee_paid, transaction_hash
      ) VALUES ($1, $2, $3, $4)`,
      [hackathonId, userId, registrationFee, transactionHash]
    );
    
    res.json({
      success: true,
      message: registrationFee > 0 
        ? `Registered! Paid ${registrationFee} ETH` 
        : 'Registered successfully (free)',
      registrationFee: registrationFee
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Check if user is registered
app.get('/api/hackathons/:id/is-registered', authenticateToken, async (req, res) => {
  const hackathonId = req.params.id;
  const userId = req.user.id;
  
  const result = await pool.query(
    'SELECT * FROM hackathon_registrations WHERE hackathon_id = $1 AND user_id = $2',
    [hackathonId, userId]
  );
  
  res.json({ isRegistered: result.rows.length > 0 });
});
```

---

## Part 3: Frontend Components

### 1. Wallet Link Button Component

```typescript
// app/components/WalletLinkButton.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, CheckCircle } from 'lucide-react';

export default function WalletLinkButton({ user, onLinked }) {
  const [linking, setLinking] = useState(false);
  
  const linkWallet = async () => {
    setLinking(true);
    
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask: https://metamask.io');
        return;
      }
      
      // Request account
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const address = accounts[0];
      
      // Sign message
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const message = `Link wallet to Hackathon Platform\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      
      // Send to backend
      const res = await fetch('/api/users/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('✅ Wallet linked successfully!');
        onLinked && onLinked(data.walletAddress);
      } else {
        alert(`Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Wallet link error:', error);
      alert('Failed to link wallet. Please try again.');
    } finally {
      setLinking(false);
    }
  };
  
  if (user?.wallet_address) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <span>Wallet Linked</span>
      </div>
    );
  }
  
  return (
    <button
      onClick={linkWallet}
      disabled={linking}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      <Wallet size={20} />
      {linking ? 'Linking...' : 'Link Wallet'}
    </button>
  );
}
```

### 2. Registration Fee Slider (Create Hackathon)

```typescript
// app/create-hackathon/page.tsx

const [registrationFee, setRegistrationFee] = useState(0);
const [expectedParticipants, setExpectedParticipants] = useState(50);

<div className="space-y-4">
  <label className="block text-sm font-medium">
    Registration Fee (Optional)
  </label>
  
  <input
    type="range"
    min="0"
    max="0.001"
    step="0.0001"
    value={registrationFee}
    onChange={(e) => setRegistrationFee(parseFloat(e.target.value))}
    className="w-full"
  />
  
  <div className="flex justify-between text-sm">
    <span>Free</span>
    <span className="font-bold">
      {registrationFee.toFixed(4)} ETH
      {registrationFee > 0 && (
        <span className="text-gray-500 ml-2">
          (${(registrationFee * 2500).toFixed(2)})
        </span>
      )}
    </span>
    <span>0.001 ETH</span>
  </div>
  
  {registrationFee > 0 && (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
      <p className="text-sm font-semibold">Revenue Calculator</p>
      <p className="text-xs text-gray-600 mt-1">
        Expected participants:
      </p>
      <input
        type="number"
        value={expectedParticipants}
        onChange={(e) => setExpectedParticipants(parseInt(e.target.value))}
        className="w-20 px-2 py-1 border rounded mt-1"
      />
      
      <div className="mt-3 p-3 bg-white rounded border border-blue-300">
        <p className="text-lg font-bold text-blue-600">
          💰 {(registrationFee * expectedParticipants).toFixed(4)} ETH
        </p>
        <p className="text-sm text-gray-600">
          ≈ ${(registrationFee * expectedParticipants * 2500).toFixed(2)} revenue
        </p>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        * You receive 100% of registration fees
      </p>
    </div>
  )}
</div>
```

### 3. Register Button (Hackathon Detail Page)

```typescript
// app/hackathons/[id]/page.tsx

const [isRegistered, setIsRegistered] = useState(false);
const [registering, setRegistering] = useState(false);

// Check registration status on load
useEffect(() => {
  if (user) {
    fetch(`/api/hackathons/${id}/is-registered`)
      .then(res => res.json())
      .then(data => setIsRegistered(data.isRegistered));
  }
}, [user, id]);

const handleRegister = async () => {
  if (!user?.wallet_address) {
    alert('Please link your wallet first!');
    setShowWalletModal(true);
    return;
  }
  
  setRegistering(true);
  
  try {
    if (hackathon.registration_fee === 0) {
      // Free registration
      const res = await fetch(`/api/hackathons/${id}/register`, {
        method: 'POST'
      });
      
      if (res.ok) {
        alert('✅ Registered successfully!');
        setIsRegistered(true);
      }
      
    } else {
      // Paid registration - need MetaMask transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Send ETH to organizer
      const tx = await signer.sendTransaction({
        to: hackathon.organizer_wallet,
        value: ethers.utils.parseEther(hackathon.registration_fee.toString())
      });
      
      await tx.wait();
      
      // Save to database
      const res = await fetch(`/api/hackathons/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionHash: tx.hash })
      });
      
      if (res.ok) {
        alert(`✅ Registered! Paid ${hackathon.registration_fee} ETH`);
        setIsRegistered(true);
      }
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  } finally {
    setRegistering(false);
  }
};

<button
  onClick={handleRegister}
  disabled={registering || isRegistered}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
>
  {isRegistered 
    ? '✓ Registered' 
    : registering 
    ? 'Registering...' 
    : hackathon.registration_fee === 0 
    ? 'Register (FREE)' 
    : `Register (${hackathon.registration_fee} ETH)`}
</button>
```

---

## Part 4: User Flow Example

### Scenario: Alice Joins a Hackathon

**Step 1: Sign Up**
```
Alice visits platform
→ Signs up with email + password
→ Account created (no wallet yet)
```

**Step 2: Browse Hackathons**
```
Alice browses hackathons
→ Sees "AI Innovation Challenge"
→ Registration Fee: 0.001 ETH ($2.50)
→ Prize Pool: 2.0 ETH
```

**Step 3: Try to Register → Blocked**
```
Alice clicks "Register"
→ Modal appears: "Wallet Required"
→ "Please link your wallet to register for hackathons"
```

**Step 4: Link Wallet**
```
Alice clicks "Link Wallet"
→ Installs MetaMask
→ Gets 0.1 ETH from Sepolia faucet
→ Connects MetaMask
→ Signs message (proves ownership)
→ ✅ Wallet linked!
```

**Step 5: Register for Hackathon**
```
Alice clicks "Register" again
→ MetaMask opens: "Send 0.001 ETH to organizer"
→ Alice confirms
→ Transaction processed
→ ✅ Registered successfully!
```

**Step 6: Submit Project**
```
Alice submits her project
→ Already has wallet linked
→ No blocking!
→ ✅ Project submitted
```

**Step 7: Win Prize**
```
Hackathon ends
→ Alice wins 1st place: 0.85 ETH
→ Prize sent automatically to her wallet
→ Net profit: 0.85 - 0.001 = 0.849 ETH ($2,122)
→ ROI: 84,900%! 🎉
```

---

## Summary

### What You Get:

✅ **Registration Fees (0 to 0.001 ETH)**
- Organizers earn revenue from participants
- Flexible pricing (free to $2.50)
- Direct payment to organizer wallet
- Reduces no-shows

✅ **Non-Custodial Wallet Linking**
- Users connect MetaMask (secure)
- Platform stores address only (no private keys)
- Signature verification proves ownership
- Required before submitting projects

✅ **Progressive Onboarding**
- Sign up without wallet (browse mode)
- Link wallet when ready to participate
- Clear prompts guide users

✅ **Complete Economic Model**
- Registration fees → Organizer (100%)
- Prize pool → Winners (85%) + Judges (10%) + Platform (5%)
- Everyone benefits!

**Next Steps:**
1. Run the database migrations
2. Add the backend endpoints
3. Create the frontend components
4. Test with Sepolia testnet
5. Deploy to production! 🚀
