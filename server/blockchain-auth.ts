// Blockchain authentication routes
import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';
import pool from '../lib/db/index.js';
import { generateToken } from '../lib/auth.js';

const router = Router();

/**
 * Verify signature helper
 * Ensures the signature was created by the wallet address
 */
function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    console.log('Verifying signature:', {
      messageLength: message.length,
      signatureLength: signature.length,
      expectedAddress
    });
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    console.log('Recovered address:', recoveredAddress);
    console.log('Expected address:', expectedAddress);
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    console.log('Signature valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * POST /api/blockchain-auth/register
 * Register a new blockchain user with wallet signature
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { walletAddress, role, signature, message, fullName, bio } = req.body;

    // Validate required fields
    if (!walletAddress || !role || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['organizer', 'participant', 'judge'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: organizer, participant, or judge' });
    }

    // Normalize wallet address
    const normalizedAddress = walletAddress.toLowerCase();

    // Verify signature
    const isValidSignature = verifySignature(message, signature, normalizedAddress);
    if (!isValidSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if message is recent (within 5 minutes)
    const messageMatch = message.match(/Timestamp: (\d+)/);
    if (messageMatch) {
      const timestamp = parseInt(messageMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp > fiveMinutes) {
        return res.status(401).json({ error: 'Signature expired. Please try again.' });
      }
    }

    // Check if wallet already registered
    const existing = await pool.query(
      'SELECT * FROM blockchain_users WHERE wallet_address = $1',
      [normalizedAddress]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Wallet already registered',
        existingUser: {
          wallet_address: existing.rows[0].wallet_address,
          role: existing.rows[0].role,
          created_at: existing.rows[0].created_at
        }
      });
    }

    // Create blockchain user
    const result = await pool.query(
      `INSERT INTO blockchain_users (wallet_address, role, full_name, bio, signature, last_login)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, wallet_address, role, full_name, bio, created_at`,
      [normalizedAddress, role, fullName || null, bio || null, signature]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
      isBlockchainUser: true
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role,
        full_name: user.full_name,
        bio: user.bio,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Blockchain registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/blockchain-auth/login
 * Login existing blockchain user with signature
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate required fields
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize wallet address
    const normalizedAddress = walletAddress.toLowerCase();

    // Verify signature
    const isValidSignature = verifySignature(message, signature, normalizedAddress);
    if (!isValidSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if message is recent (within 5 minutes)
    const messageMatch = message.match(/Timestamp: (\d+)/);
    if (messageMatch) {
      const timestamp = parseInt(messageMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp > fiveMinutes) {
        return res.status(401).json({ error: 'Signature expired. Please try again.' });
      }
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM blockchain_users WHERE wallet_address = $1',
      [normalizedAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Wallet not registered. Please register first.',
        needsRegistration: true
      });
    }

    const user = result.rows[0];

    // Update last login and signature
    await pool.query(
      'UPDATE blockchain_users SET last_login = NOW(), signature = $1 WHERE id = $2',
      [signature, user.id]
    );

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address,
      role: user.role,
      isBlockchainUser: true
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        role: user.role,
        full_name: user.full_name,
        bio: user.bio,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url,
        created_at: user.created_at,
        last_login: new Date()
      },
      token
    });
  } catch (error) {
    console.error('Blockchain login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/blockchain-auth/verify
 * Verify if a wallet is registered and get user info
 */
router.get('/verify/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const normalizedAddress = walletAddress.toLowerCase();

    console.log('Verifying wallet:', normalizedAddress);
    console.log('Database pool status:', pool.totalCount, 'total,', pool.idleCount, 'idle');
    
    const result = await pool.query(
      'SELECT id, wallet_address, role, full_name, bio, github_url, linkedin_url, created_at, last_login FROM blockchain_users WHERE wallet_address = $1',
      [normalizedAddress]
    );

    console.log('Query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      return res.json({ 
        registered: false,
        needsRegistration: true
      });
    }

    res.json({
      registered: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * PUT /api/blockchain-auth/profile
 * Update blockchain user profile
 * Requires valid JWT token
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    // TODO: Add authenticate middleware to verify JWT token
    const { walletAddress, fullName, bio, githubUrl, linkedinUrl } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const result = await pool.query(
      `UPDATE blockchain_users 
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           github_url = COALESCE($3, github_url),
           linkedin_url = COALESCE($4, linkedin_url),
           updated_at = NOW()
       WHERE wallet_address = $5
       RETURNING id, wallet_address, role, full_name, bio, github_url, linkedin_url`,
      [fullName, bio, githubUrl, linkedinUrl, normalizedAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

/**
 * GET /api/blockchain-auth/stats
 * Get blockchain user statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'organizer' THEN 1 END) as organizers,
        COUNT(CASE WHEN role = 'participant' THEN 1 END) as participants,
        COUNT(CASE WHEN role = 'judge' THEN 1 END) as judges,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d        
      FROM blockchain_users
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/blockchain-auth/users
 * Get blockchain users, optionally filtered by role
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    let query = 'SELECT id, wallet_address, role, full_name, bio, github_url, linkedin_url, created_at FROM blockchain_users';
    const params: any[] = [];
    
    if (role && ['organizer', 'participant', 'judge'].includes(role as string)) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;