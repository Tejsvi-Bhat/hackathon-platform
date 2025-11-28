import express from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import pool from './db.js';

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify signature
function verifySignature(message, signature, expectedAddress) {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Helper function to generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.isBlockchainUser) {
      return res.status(401).json({ error: 'Invalid blockchain token' });
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, wallet_address, role, full_name, bio, github_url, linkedin_url, last_login FROM blockchain_users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Check if wallet is registered
router.get('/verify/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const result = await pool.query(
      'SELECT id, wallet_address, role, full_name, created_at FROM blockchain_users WHERE wallet_address = $1',
      [walletAddress.toLowerCase()]
    );

    if (result.rows.length > 0) {
      res.json({
        registered: true,
        user: result.rows[0]
      });
    } else {
      res.json({
        registered: false,
        needsRegistration: true
      });
    }
  } catch (error) {
    console.error('Verify wallet error:', error);
    res.status(500).json({ error: 'Failed to verify wallet' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, role, signature, message, fullName, bio, githubUrl, linkedinUrl } = req.body;

    // Validate required fields
    if (!walletAddress || !role || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    const validRoles = ['organizer', 'participant', 'judge'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check timestamp (5 minute expiry)
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp > fiveMinutes) {
        return res.status(400).json({ error: 'Signature expired' });
      }
    }

    // Check if wallet already registered
    const existingUser = await pool.query(
      'SELECT id FROM blockchain_users WHERE wallet_address = $1',
      [walletAddress.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Wallet already registered' });
    }

    // Create new user
    const result = await pool.query(
      `INSERT INTO blockchain_users (
        wallet_address, role, full_name, bio, github_url, linkedin_url, 
        signature, last_login, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, wallet_address, role, full_name, created_at`,
      [
        walletAddress.toLowerCase(),
        role,
        fullName || null,
        bio || null,
        githubUrl || null,
        linkedinUrl || null,
        signature
      ]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
      isBlockchainUser: true
    });

    res.status(201).json({
      success: true,
      user,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate required fields
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Check timestamp (5 minute expiry)
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp > fiveMinutes) {
        return res.status(400).json({ error: 'Signature expired' });
      }
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, wallet_address, role, full_name, bio, github_url, linkedin_url FROM blockchain_users WHERE wallet_address = $1',
      [walletAddress.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Update last login and signature
    await pool.query(
      'UPDATE blockchain_users SET last_login = CURRENT_TIMESTAMP, signature = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [signature, user.id]
    );

    // Generate token
    const token = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
      isBlockchainUser: true
    });

    res.json({
      success: true,
      user: {
        ...user,
        last_login: new Date().toISOString()
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { walletAddress, fullName, bio, githubUrl, linkedinUrl } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const result = await pool.query(
      `UPDATE blockchain_users 
       SET full_name = $1, bio = $2, github_url = $3, linkedin_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE wallet_address = $5
       RETURNING id, wallet_address, role, full_name, bio, github_url, linkedin_url`,
      [fullName, bio, githubUrl, linkedinUrl, walletAddress.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'organizer' THEN 1 END) as organizers,
        COUNT(CASE WHEN role = 'participant' THEN 1 END) as participants,
        COUNT(CASE WHEN role = 'judge' THEN 1 END) as judges,
        COUNT(CASE WHEN last_login > CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_users_7d
       FROM blockchain_users`
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;