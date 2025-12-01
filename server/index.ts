import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import pool from '../lib/db/index.js';
import { generateToken } from '../lib/auth.js';
import blockchainAuthRouter from './blockchain-auth.js';
import jwt from 'jsonwebtoken';

// Define custom request interface
interface AuthRequest extends Request {
  user?: {
    userId: number;
    walletAddress?: string;
    role: string;
    isBlockchainUser?: boolean;
  };
  headers: any;
  params: any;
  body: any;
}

// Simple middleware placeholder functions
const authenticate = (req: any, res: any, next: any) => next();
const authorize = (role: string) => (req: any, res: any, next: any) => next();

// Custom authentication middleware for blockchain mode compatibility
const authenticateUnified = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('🔍 Token decoded:', decoded);

    if (decoded.isBlockchainUser) {
      // Handle blockchain user
      const result = await pool.query(
        'SELECT * FROM blockchain_users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Blockchain user not found' });
      }

      req.user = {
        userId: result.rows[0].id,
        walletAddress: result.rows[0].wallet_address,
        role: result.rows[0].role,
        isBlockchainUser: true
      } as any;
      console.log('✅ Blockchain user authenticated:', req.user);
    } else {
      // Handle traditional database user - fallback to original middleware
      return authenticate(req, res, next);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Blockchain authentication routes
app.use('/api/blockchain-auth', blockchainAuthRouter);

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role, walletAddress, bio } = req.body;

    // Validate role
    if (!['organizer', 'judge', 'hacker'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR wallet_address = $2',
      [email, walletAddress]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (wallet_address, email, password_hash, full_name, role, bio)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, wallet_address`,
      [walletAddress, email, passwordHash, fullName, role, bio || null]
    );

    const user = result.rows[0];
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.wallet_address
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.wallet_address
    });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        walletAddress: user.wallet_address
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, wallet_address, bio, github_url, linkedin_url FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Test bcrypt hash (temporary)
app.post('/api/auth/test-hash', async (req: Request, res: Response) => {
  try {
    const { password, hash } = req.body;
    const isValid = await bcrypt.compare(password, hash);
    const newHash = await bcrypt.hash(password, 10);
    res.json({ isValid, newHash, providedHash: hash });
  } catch (error) {
    res.status(500).json({ error: 'Test failed' });
  }
});

// ============ HACKATHON ROUTES ============

// Get all hackathons (public)
app.get('/api/hackathons', async (req: Request, res: Response) => {
  try {
    const { status, mode } = req.query;
    
    // Check if blockchain mode is requested or if we have blockchain hackathons
    const useBlockchainMode = mode === 'blockchain' || process.env.DEFAULT_MODE === 'blockchain';
    
    if (useBlockchainMode) {
      console.log('📱 Fetching all hackathons from smart contract...');
      
      try {
        // Import blockchain functions
        const { getHackathonCountFromChain, getHackathonFromChain, getProjectsFromChain, getPrizesFromChain } = await import('../lib/blockchain.js');
        
        const hackathonCount = await getHackathonCountFromChain();
        console.log(`📊 Total hackathons on chain: ${hackathonCount}`);
        
        const allHackathons: any[] = [];
        
        // Get all hackathons from the contract
        for (let i = 1; i <= hackathonCount; i++) {
          try {
            const hackathon = await getHackathonFromChain(i);
            
            // Get project count for this hackathon
            let projectCount = 0;
            try {
              const projects = await getProjectsFromChain(i);
              projectCount = projects.length;
            } catch (error) {
              projectCount = 0;
            }
            
            // Determine status based on dates
            const now = Date.now();
            const startTime = Number(hackathon.startDate) * 1000;
            const endTime = Number(hackathon.endDate) * 1000;
            
            let hackathonStatus = 'upcoming';
            if (now >= startTime && now <= endTime) {
              hackathonStatus = 'active';
            } else if (now > endTime) {
              hackathonStatus = 'completed';
            }
            
            // Skip if status filter is applied and doesn't match
            if (status && hackathonStatus !== status) {
              continue;
            }
            
            // Get prizes for this hackathon to calculate total prize pool
            let totalPrizePool = 0;
            let prizes: any[] = [];
            try {
              prizes = await getPrizesFromChain(i);
              if (prizes && prizes.length > 0) {
                totalPrizePool = prizes.reduce((sum: number, prize: any) => sum + Number(prize.amount), 0);
              } else {
                // Fall back to total prize pool from hackathon if no individual prizes
                totalPrizePool = hackathon.prizePoolWei ? Number(hackathon.prizePoolWei) / 1e18 : 0;
              }
            } catch (error) {
              // Fall back to total prize pool from hackathon
              totalPrizePool = hackathon.prizePoolWei ? Number(hackathon.prizePoolWei) / 1e18 : 0;
            }
            
            // If no prizes found and no prize pool, create default prizes
            if ((!prizes || prizes.length === 0) && totalPrizePool === 0) {
              const defaultPrizes = [
                { title: '1st Place', amount: 1000, position: 1 },
                { title: '2nd Place', amount: 500, position: 2 },
                { title: '3rd Place', amount: 250, position: 3 }
              ];
              totalPrizePool = defaultPrizes.reduce((sum, prize) => sum + prize.amount, 0);
              console.log(`Created default prize pool of ${totalPrizePool} HC for hackathon ${i}`);
            }
            
            const hackathonData = {
              id: i,
              blockchain_id: i,
              name: hackathon.name,
              description: hackathon.description,
              start_date: new Date(startTime).toISOString(),
              end_date: new Date(endTime).toISOString(),
              registration_deadline: new Date(Number(hackathon.registrationDeadline) * 1000).toISOString(),
              organizer_address: hackathon.organizer,
              organizer_name: `Organizer (${hackathon.organizer.substring(0, 8)}...)`,
              organizer_email: null,
              total_prize_pool: totalPrizePool.toString(),
              max_participants: Number(hackathon.maxParticipants || 0),
              status: hackathonStatus,
              participant_count: 0, // Contract doesn't track registrations
              project_count: projectCount,
              is_featured: false, // Contract doesn't have featured flag
              created_at: new Date(startTime).toISOString(),
              hackathon_type: 'blockchain'
            };
            
            allHackathons.push(hackathonData);
          } catch (hackathonError: any) {
            console.warn(`⚠️ Error fetching hackathon ${i}:`, hackathonError?.message);
          }
        }
        
        // Sort by start date (newest first)
        allHackathons.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        
        console.log(`✅ Returning ${allHackathons.length} hackathons from blockchain`);
        res.json(allHackathons);
        
      } catch (blockchainError: any) {
        console.error('❌ Blockchain error, falling back to database:', blockchainError?.message);
        // Fall back to database mode if blockchain fails
      }
    } 
    
    // Database mode (default or fallback)
    if (!useBlockchainMode || res.headersSent === false) {
      console.log('🗄️ Fetching hackathons from database...');
      
      let query = `
        SELECT h.*, u.full_name as organizer_name, u.email as organizer_email,
          (SELECT COUNT(*) FROM registrations WHERE hackathon_id = h.id) as participant_count,
          (SELECT COUNT(*) FROM projects WHERE hackathon_id = h.id) as project_count
        FROM hackathons h
        JOIN users u ON h.organizer_id = u.id
      `;

      const params: any[] = [];
      if (status) {
        query += ' WHERE h.status = $1';
        params.push(status);
      }

      query += ' ORDER BY h.is_featured DESC, h.start_date DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

// Get single hackathon
app.get('/api/hackathons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = req.query;
    
    // Validate hackathon ID is a valid number
    const hackathonId = parseInt(id);
    if (isNaN(hackathonId) || hackathonId <= 0) {
      return res.status(400).json({ error: 'Invalid hackathon ID' });
    }
    
    // Check if blockchain mode is requested or default
    const useBlockchainMode = mode === 'blockchain' || process.env.DEFAULT_MODE === 'blockchain';
    
    if (useBlockchainMode) {
      console.log(`📱 Fetching hackathon ${hackathonId} from smart contract...`);
      
      try {
        // Import blockchain functions
        const { getHackathonFromChain, getPrizesFromChain, getProjectsFromChain, getJudgesFromChain } = await import('../lib/blockchain.js');
        
        const hackathon = await getHackathonFromChain(hackathonId);
        
        // Get additional data from contract
        let prizes: any[] = [];
        let projects: any[] = [];
        let judges: any[] = [];
        
        try {
          prizes = await getPrizesFromChain(hackathonId);
        } catch (error) {
          console.log(`No prizes found for hackathon ${hackathonId}`);
        }
        
        try {
          projects = await getProjectsFromChain(hackathonId);
          
          // Map contract project IDs to blockchain project IDs format (hackathon-project)
          projects = projects.map((project: any, index: number) => ({
            ...project,
            id: `${hackathonId}-${project.id || (index + 1)}` // Convert to "3-1", "3-2" format
          }));
          
        } catch (error) {
          console.log(`No projects found for hackathon ${hackathonId}`);
        }
        
        try {
          judges = await getJudgesFromChain(hackathonId);
          console.log(`Found ${judges.length} judges in contract for hackathon ${hackathonId}`);
        } catch (error) {
          console.log(`No judges found for hackathon ${hackathonId}`);
        }
        
        // Only use actual contract prizes - no defaults
        
        // Calculate total prize pool by summing all prizes, or fall back to contract prize pool
        let totalPrizePool = 0;
        if (prizes && prizes.length > 0) {
          totalPrizePool = prizes.reduce((sum: number, prize: any) => sum + Number(prize.amount), 0);
        } else {
          // Fall back to total prize pool from hackathon if no individual prizes
          totalPrizePool = hackathon.prizePoolWei ? Number(hackathon.prizePoolWei) / 1e18 : 0;
        }
        
        // Transform contract data to match expected format
        const hackathonData = {
          id: hackathonId,
          blockchain_id: hackathonId,
          name: hackathon.name,
          description: hackathon.description,
          start_date: new Date(Number(hackathon.startDate) * 1000).toISOString(),
          end_date: new Date(Number(hackathon.endDate) * 1000).toISOString(),
          registration_deadline: new Date(Number(hackathon.registrationDeadline) * 1000).toISOString(),
          organizer_address: hackathon.organizer,
          organizer_name: `Organizer (${hackathon.organizer.substring(0, 8)}...)`,
          organizer_email: null,
          total_prize_pool: totalPrizePool.toString(),
          max_participants: Number(hackathon.maxParticipants || 0),
          status: Number(hackathon.endDate) * 1000 > Date.now() ? 'active' : 'completed',
          participant_count: 0, // Contract doesn't track registrations separately
          project_count: projects.length,
          prizes: prizes.map((prize: any, index: number) => ({
            id: index + 1,
            title: `Position ${index + 1}`,
            amount: Number(prize.amount),
            position: index + 1,
            description: `Prize for position ${index + 1}`
          })),
          schedules: [
            {
              id: 1,
              event_name: "Registration Deadline",
              description: "Last day to register for the hackathon",
              event_time: new Date(Number(hackathon.registrationDeadline) * 1000).toISOString()
            },
            {
              id: 2,
              event_name: "Hackathon Starts",
              description: "Coding phase begins - let the hacking commence!", 
              event_time: new Date(Number(hackathon.startDate) * 1000).toISOString()
            },
            {
              id: 3,
              event_name: "Hackathon Ends",
              description: "Final submission deadline - time to submit your projects!",
              event_time: new Date(Number(hackathon.endDate) * 1000).toISOString()
            }
          ],
          judges: judges.map((judge: any, index: number) => ({
            id: index + 1,
            full_name: `Judge (${judge.substring(0, 8)}...)`,
            wallet_address: judge,
            email: null,
            bio: null
          })),
          projects: projects.map((project: any, index: number) => ({
            id: project.id,  // Use blockchain project ID (e.g., "1-1", "2-1")
            name: project.name,
            description: project.description,
            github_url: project.githubUrl,
            demo_url: project.demoUrl,
            team_members: [{
              user_id: null,
              full_name: `Participant (${project.submitter.substring(0, 8)}...)`,
              role: 'owner'
            }]
          })),
          faqs: [], // Contract doesn't store FAQs
          hackathon_type: 'blockchain'
        };
        
        res.json(hackathonData);
        
      } catch (blockchainError: any) {
        console.error(`❌ Blockchain error for hackathon ${hackathonId}:`, blockchainError?.message);
        return res.status(404).json({ error: 'Hackathon not found on blockchain' });
      }
    } else {
      // Database mode
      console.log(`🗄️ Fetching hackathon ${id} from database...`);
      
      const hackathonResult = await pool.query(
        `SELECT h.*, u.full_name as organizer_name, u.email as organizer_email
         FROM hackathons h
         JOIN users u ON h.organizer_id = u.id
         WHERE h.id = $1`,
        [id]
      );

      if (hackathonResult.rows.length === 0) {
        return res.status(404).json({ error: 'Hackathon not found' });
      }

      const hackathon = hackathonResult.rows[0];

      // Get prizes
      const prizes = await pool.query(
        'SELECT * FROM prizes WHERE hackathon_id = $1 ORDER BY position',
        [id]
      );

      // Get schedules
      const schedules = await pool.query(
        'SELECT id, hackathon_id, blockchain_schedule_id, event_name, description, event_time as event_date, location, created_at FROM schedules WHERE hackathon_id = $1 ORDER BY event_time',
        [id]
      );

      // Get judges
      const judges = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.bio, u.wallet_address
         FROM hackathon_judges hj
         JOIN users u ON hj.judge_id = u.id
         WHERE hj.hackathon_id = $1`,
        [id]
      );

      // Get projects
      const projects = await pool.query(
        `SELECT p.*, 
          (SELECT json_agg(json_build_object('user_id', pm.user_id, 'full_name', u.full_name, 'role', pm.role))
           FROM project_members pm
           JOIN users u ON pm.user_id = u.id
           WHERE pm.project_id = p.id) as team_members
         FROM projects p
         WHERE p.hackathon_id = $1
         ORDER BY p.submitted_at DESC`,
        [id]
      );

      // Get counts
      const participantCount = await pool.query(
        'SELECT COUNT(DISTINCT user_id) as count FROM registrations WHERE hackathon_id = $1',
        [id]
      );

      // Get FAQs
      const faqs = await pool.query(
        'SELECT * FROM hackathon_faqs WHERE hackathon_id = $1 ORDER BY display_order',
        [id]
      );

      res.json({
        ...hackathon,
        prizes: prizes.rows,
        schedules: schedules.rows,
        judges: judges.rows,
        projects: projects.rows,
        faqs: faqs.rows,
        participant_count: parseInt(participantCount.rows[0]?.count || '0'),
        project_count: projects.rows.length
      });
    }
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    res.status(500).json({ error: 'Failed to fetch hackathon' });
  }
});

// Create hackathon (organizers only)
app.post('/api/hackathons', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, description, start_date, end_date, registration_deadline,
      ecosystem, tech_stack, level, mode, min_team_size, max_team_size,
      banner_image, is_featured
    } = req.body;
    
    // Generate unique blockchain_id
    const maxIdResult = await pool.query('SELECT MAX(blockchain_id) as max FROM hackathons');
    const nextId = (maxIdResult.rows[0]?.max || 0) + 1;

    // Determine status based on dates
    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    let status = 'upcoming';
    if (now >= startDate && now <= endDate) status = 'ongoing';
    if (now > endDate) status = 'completed';

    const result = await pool.query(
      `INSERT INTO hackathons (
        blockchain_id, name, description, start_date, end_date, registration_deadline,
        organizer_id, organizer_address, status, is_active, banner_image,
        ecosystem, tech_stack, level, mode, max_team_size, min_team_size, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        nextId, name, description, start_date, end_date, registration_deadline,
        req.user!.userId, req.user!.walletAddress, status, true, banner_image,
        ecosystem, tech_stack, level, mode, max_team_size, min_team_size, is_featured || false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hackathon:', error);
    res.status(500).json({ error: 'Failed to create hackathon' });
  }
});

// Add prize
app.post('/api/hackathons/:id/prizes', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, amount, position, blockchainPrizeId, evaluation_criteria } = req.body;

    // Verify ownership
    const hackathon = await pool.query(
      'SELECT * FROM hackathons WHERE id = $1 AND organizer_id = $2',
      [id, req.user!.userId]
    );

    if (hackathon.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Auto-generate blockchain_prize_id if not provided
    const nextBlockchainId = blockchainPrizeId || Math.floor(Math.random() * 1000000) + 1;

    const result = await pool.query(
      `INSERT INTO prizes (hackathon_id, blockchain_prize_id, title, description, amount, position)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, nextBlockchainId, title, description || '', amount, position]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding prize:', error);
    res.status(500).json({ error: 'Failed to add prize' });
  }
});

// Add schedule
app.post('/api/hackathons/:id/schedules', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { eventName, description, eventTime, location, blockchainScheduleId } = req.body;

    const hackathon = await pool.query(
      'SELECT * FROM hackathons WHERE id = $1 AND organizer_id = $2',
      [id, req.user!.userId]
    );

    if (hackathon.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(
      `INSERT INTO schedules (hackathon_id, blockchain_schedule_id, event_name, description, event_time, location)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, blockchainScheduleId, eventName, description, eventTime, location]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Failed to add schedule' });
  }
});

// Add judge
app.post('/api/hackathons/:id/judges', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { judge_id, judgeId } = req.body;
    const targetJudgeId = judge_id || judgeId; // Support both field names

    const hackathon = await pool.query(
      'SELECT * FROM hackathons WHERE id = $1 AND organizer_id = $2',
      [id, req.user!.userId]
    );

    if (hackathon.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const judge = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2',
      [targetJudgeId, 'judge']
    );

    if (judge.rows.length === 0) {
      return res.status(404).json({ error: 'Judge not found' });
    }

    const result = await pool.query(
      `INSERT INTO hackathon_judges (hackathon_id, judge_id, judge_address)
       VALUES ($1, $2, $3)
       ON CONFLICT (hackathon_id, judge_id) DO NOTHING
       RETURNING *`,
      [id, targetJudgeId, judge.rows[0].wallet_address]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding judge:', error);
    res.status(500).json({ error: 'Failed to add judge' });
  }
});

// Check if user is registered for hackathon
app.get('/api/hackathons/:id/check-registration', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isBlockchainUser = !!req.user!.walletAddress;
    
    let result;
    if (isBlockchainUser) {
      result = await pool.query(
        'SELECT * FROM blockchain_registrations WHERE hackathon_id = $1 AND user_id = $2',
        [id, req.user!.userId]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM registrations WHERE hackathon_id = $1 AND user_id = $2',
        [id, req.user!.userId]
      );
    }
    
    res.json({ isRegistered: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({ error: 'Failed to check registration' });
  }
});

// Get blockchain hackathon stats (registration count, etc.)
app.get('/api/hackathons/:id/blockchain-stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const registrationCount = await pool.query(
      'SELECT COUNT(*) as count FROM blockchain_registrations WHERE hackathon_id = $1',
      [id]
    );
    
    res.json({
      participant_count: parseInt(registrationCount.rows[0]?.count || '0')
    });
  } catch (error) {
    console.error('Error fetching blockchain hackathon stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Register for hackathon
app.post('/api/hackathons/:id/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const walletAddress = req.user!.walletAddress || req.body.walletAddress;
    const isBlockchainUser = !!req.user!.walletAddress;

    console.log('Registration request:', {
      hackathonId: id,
      userId: req.user!.userId,
      userRole: req.user!.role,
      walletAddress: walletAddress,
      isBlockchainUser: isBlockchainUser
    });

    let result;
    
    if (isBlockchainUser) {
      // Use blockchain_registrations table for blockchain users
      result = await pool.query(
        `INSERT INTO blockchain_registrations (hackathon_id, user_id, participant_address, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (hackathon_id, user_id) DO NOTHING
         RETURNING *`,
        [id, req.user!.userId, walletAddress, 'confirmed']
      );
    } else {
      // Use regular registrations table for database users
      result = await pool.query(
        `INSERT INTO registrations (hackathon_id, user_id, participant_address, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (hackathon_id, user_id) DO NOTHING
         RETURNING *`,
        [id, req.user!.userId, walletAddress, 'confirmed']
      );
    }

    if (result.rows.length === 0) {
      console.log('User already registered');
      return res.status(400).json({ error: 'Already registered' });
    }

    console.log('Registration successful:', result.rows[0]);

    // Create notification (only for database mode hackathons)
    if (!isBlockchainUser) {
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, hackathon_id, title, message, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.user!.userId, id, 'Registration Confirmed', 'Your registration has been confirmed!', 'registration']
        );
      } catch (notifError) {
        console.log('Could not create notification:', notifError);
        // Don't fail the registration if notification fails
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error registering:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    res.status(500).json({ 
      error: 'Failed to register',
      details: error.message,
      code: error.code
    });
  }
});

// ============ PROJECT ROUTES ============

// Get projects for hackathon
app.get('/api/hackathons/:id/projects', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, 
        json_agg(json_build_object(
          'userId', u.id,
          'fullName', u.full_name,
          'role', pm.role
        )) as team_members
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE p.hackathon_id = $1
       GROUP BY p.id
       ORDER BY p.submitted_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ============ SCORING ROUTES ============

// Score project (judges only)
// Get leaderboard
app.get('/api/hackathons/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.id as project_id,
        p.name as project_name,
        p.description,
        p.github_url,
        p.demo_url,
        COALESCE(
          json_agg(u.full_name) FILTER (WHERE u.full_name IS NOT NULL),
          '[]'
        ) as team_members,
        ROUND(AVG(s.total_score), 1) as average_score,
        COUNT(DISTINCT s.judge_id) as num_judges
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       LEFT JOIN scores s ON p.id = s.project_id
       WHERE p.hackathon_id = $1
       GROUP BY p.id, p.name, p.description, p.github_url, p.demo_url
       HAVING AVG(s.total_score) IS NOT NULL
       ORDER BY average_score DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Release scores (organizers only)
app.post('/api/hackathons/:id/release-scores', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const hackathon = await pool.query(
      'SELECT * FROM hackathons WHERE id = $1 AND organizer_id = $2',
      [id, req.user!.userId]
    );

    if (hackathon.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update hackathon status
    await pool.query(
      'UPDATE hackathons SET status = $1 WHERE id = $2',
      ['completed', id]
    );

    // Notify all participants
    const participants = await pool.query(
      'SELECT DISTINCT user_id FROM registrations WHERE hackathon_id = $1',
      [id]
    );

    for (const participant of participants.rows) {
      await pool.query(
        `INSERT INTO notifications (user_id, hackathon_id, title, message, type)
         VALUES ($1, $2, $3, $4, $5)`,
        [participant.user_id, id, 'Scores Released', 'The final scores and rankings are now available!', 'scores']
      );
    }

    res.json({ message: 'Scores released successfully' });
  } catch (error) {
    console.error('Error releasing scores:', error);
    res.status(500).json({ error: 'Failed to release scores' });
  }
});

// ============ USER DASHBOARD ROUTES ============

// Get user dashboard stats
app.get('/api/dashboard/stats', authenticateUnified, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let stats: any = {};

    if (role === 'hacker') {
      // Get hackathons registered
      const registered = await pool.query(
        'SELECT COUNT(*) FROM registrations WHERE user_id = $1',
        [userId]
      );

      // Get projects submitted
      const projects = await pool.query(
        'SELECT COUNT(*) FROM project_members WHERE user_id = $1',
        [userId]
      );

      // Get wins/ranks
      const wins = await pool.query(
        `SELECT COUNT(*) FROM (
          SELECT p.id
          FROM projects p
          JOIN project_members pm ON p.id = pm.project_id
          JOIN scores s ON p.id = s.project_id
          WHERE pm.user_id = $1
          GROUP BY p.id, p.hackathon_id
          HAVING RANK() OVER (PARTITION BY p.hackathon_id ORDER BY AVG(s.total_score) DESC) <= 3
        ) AS ranked`,
        [userId]
      );

      stats = {
        hackathonsRegistered: parseInt(registered.rows[0].count),
        projectsSubmitted: parseInt(projects.rows[0].count),
        wins: parseInt(wins.rows[0].count)
      };
    } else if (role === 'judge') {
      // Get hackathons judging
      const judging = await pool.query(
        'SELECT COUNT(*) FROM hackathon_judges WHERE judge_id = $1',
        [userId]
      );

      // Get projects scored
      const scored = await pool.query(
        'SELECT COUNT(*) FROM scores WHERE judge_id = $1',
        [userId]
      );

      stats = {
        hackathonsJudging: parseInt(judging.rows[0].count),
        projectsScored: parseInt(scored.rows[0].count)
      };
    } else if (role === 'organizer') {
      // Get hackathons organized
      const organized = await pool.query(
        'SELECT COUNT(*) FROM hackathons WHERE organizer_id = $1',
        [userId]
      );

      // Get total participants
      const participants = await pool.query(
        `SELECT COUNT(DISTINCT r.user_id)
         FROM registrations r
         JOIN hackathons h ON r.hackathon_id = h.id
         WHERE h.organizer_id = $1`,
        [userId]
      );

      // Get total projects
      const projects = await pool.query(
        `SELECT COUNT(DISTINCT p.id)
         FROM projects p
         JOIN hackathons h ON p.hackathon_id = h.id
         WHERE h.organizer_id = $1`,
        [userId]
      );

      stats = {
        hackathonsOrganized: parseInt(organized.rows[0].count),
        totalParticipants: parseInt(participants.rows[0].count),
        totalProjects: parseInt(projects.rows[0].count)
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get user notifications
app.get('/api/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT n.*, h.name as hackathon_name
       FROM notifications n
       LEFT JOIN hackathons h ON n.hackathon_id = h.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user!.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Get all judges (for organizers)
app.get('/api/judges', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, bio, wallet_address
       FROM users
       WHERE role = 'judge'
       ORDER BY full_name`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching judges:', error);
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
});

// ============ DASHBOARD ROUTES ============

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateUnified, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role === 'hacker') {
      const registrations = await pool.query(
        'SELECT COUNT(*) as count FROM registrations WHERE user_id = $1',
        [userId]
      );
      
      const projects = await pool.query(
        'SELECT COUNT(*) as count FROM projects WHERE user_id = $1',
        [userId]
      );

      res.json({
        hackathonsRegistered: parseInt(registrations.rows[0]?.count || '0'),
        projectsSubmitted: parseInt(projects.rows[0]?.count || '0'),
        wins: 0 // TODO: Calculate from rankings
      });
    } else if (role === 'judge') {
      const judging = await pool.query(
        'SELECT COUNT(*) as count FROM hackathon_judges WHERE judge_id = $1',
        [userId]
      );

      const scored = await pool.query(
        'SELECT COUNT(DISTINCT project_id) as count FROM scores WHERE judge_id = $1',
        [userId]
      );

      res.json({
        hackathonsJudging: parseInt(judging.rows[0]?.count || '0'),
        projectsScored: parseInt(scored.rows[0]?.count || '0')
      });
    } else if (role === 'organizer') {
      const hackathons = await pool.query(
        'SELECT COUNT(*) as count FROM hackathons WHERE organizer_id = $1',
        [userId]
      );

      const participants = await pool.query(
        `SELECT COUNT(DISTINCT r.user_id) as count 
         FROM registrations r
         JOIN hackathons h ON r.hackathon_id = h.id
         WHERE h.organizer_id = $1`,
        [userId]
      );

      const projects = await pool.query(
        `SELECT COUNT(*) as count 
         FROM projects p
         JOIN hackathons h ON p.hackathon_id = h.id
         WHERE h.organizer_id = $1`,
        [userId]
      );

      res.json({
        hackathonsOrganized: parseInt(hackathons.rows[0]?.count || '0'),
        totalParticipants: parseInt(participants.rows[0]?.count || '0'),
        totalProjects: parseInt(projects.rows[0]?.count || '0')
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============ PROJECT ROUTES ============

// Get all public projects
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const { mode } = req.query;
    
    // Check if blockchain mode is requested or default
    const useBlockchainMode = mode === 'blockchain' || process.env.DEFAULT_MODE === 'blockchain';
    
    if (useBlockchainMode) {
      console.log('📱 Fetching projects from smart contract...');
      
      try {
        // Import blockchain functions
        const { getHackathonCountFromChain, getHackathonFromChain, getProjectsFromChain } = await import('../lib/blockchain.js');
        
        const hackathonCount = await getHackathonCountFromChain();
        const allProjects: any[] = [];
        
        // Get projects from all hackathons
        for (let i = 1; i <= hackathonCount; i++) {
          try {
            const hackathon = await getHackathonFromChain(i);
            const projects = await getProjectsFromChain(i);
            
            for (const project of projects) {
              allProjects.push({
                id: `${i}-${project.id}`, // Unique ID: hackathonId-projectId
                blockchain_id: project.id,
                hackathon_id: i,
                name: project.name,
                description: project.description,
                github_url: project.githubUrl,
                demo_url: project.demoUrl,
                video_url: null,
                submitted_at: new Date(project.submissionTimestamp * 1000).toISOString(),
                is_public: true,
                tags: [],
                hackathon_name: hackathon.name,
                team_members: [{
                  id: null,
                  name: `Participant (${project.submitter.substring(0, 8)}...)`
                }],
                submitter_address: project.submitter,
                project_type: 'blockchain'
              });
            }
          } catch (error) {
            console.log(`No projects found for hackathon ${i}`);
          }
        }
        
        // Sort by submission date (newest first)
        allProjects.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
        
        res.json(allProjects);
        
      } catch (blockchainError: any) {
        console.error('❌ Blockchain error:', blockchainError?.message);
        // Fall back to database mode
        return getProjectsFromDatabase();
      }
    } else {
      return getProjectsFromDatabase();
    }
    
    function getProjectsFromDatabase() {
      console.log('🗄️ Fetching projects from database...');
      
      pool.query(
        `SELECT p.id, p.name, p.description, p.github_url, p.demo_url, p.video_url,
                p.submitted_at, p.is_public, p.tags,
                h.name as hackathon_name,
                COALESCE(
                  json_agg(
                    json_build_object('id', u.id, 'name', u.full_name)
                  ) FILTER (WHERE u.id IS NOT NULL), '[]'
                ) as team_members
         FROM projects p
         LEFT JOIN hackathons h ON p.hackathon_id = h.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         LEFT JOIN users u ON pm.user_id = u.id
         WHERE p.is_public = TRUE 
         AND EXISTS (
           SELECT 1 FROM project_members pm2 
           WHERE pm2.project_id = p.id 
           AND pm2.user_id IS NOT NULL
         )
         GROUP BY p.id, h.name
         ORDER BY p.submitted_at DESC`
      ).then(result => {
        res.json(result.rows);
      }).catch(error => {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
      });
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get blockchain projects 
app.get('/api/blockchain/projects', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.blockchain_project_id, p.name, p.description, p.github_url, p.demo_url, p.video_url,
              p.submitted_at, p.is_public, p.tags,
              h.name as hackathon_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', pm.id,
                    'name', COALESCE(bu.full_name, CONCAT(SUBSTRING(pm.member_address, 1, 6), '...', SUBSTRING(pm.member_address FROM LENGTH(pm.member_address) - 3))),
                    'address', pm.member_address, 
                    'role', pm.role
                  )
                ) FILTER (WHERE pm.member_address IS NOT NULL), '[]'
              ) as team_members
       FROM projects p
       LEFT JOIN hackathons h ON p.hackathon_id = h.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN blockchain_users bu ON pm.member_address = bu.wallet_address
       WHERE pm.member_address IS NOT NULL
       GROUP BY p.id, h.name
       ORDER BY p.submitted_at DESC`
    );

    console.log(`Found ${result.rows.length} blockchain/mixed projects`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blockchain projects:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain projects' });
  }
});

// Get user's projects
app.get('/api/users/me/projects', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isBlockchainUser = req.user!.isBlockchainUser || !!req.user!.walletAddress;
    
    let result;
    if (isBlockchainUser) {
      // For blockchain users, match by member_address
      result = await pool.query(
        `SELECT DISTINCT p.id, p.blockchain_project_id, p.name as title, p.description, p.github_url,
                p.demo_url, p.video_url as image_url, p.submitted_at as created_at,
                h.name as hackathon_name, ARRAY[]::text[] as tags
         FROM projects p
         LEFT JOIN hackathons h ON p.hackathon_id = h.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.member_address = $1
         ORDER BY p.submitted_at DESC`,
        [req.user!.walletAddress?.toLowerCase()]
      );
    } else {
      // For database users, match by user_id
      result = await pool.query(
        `SELECT DISTINCT p.id, p.blockchain_project_id, p.name as title, p.description, p.github_url,
                p.demo_url, p.video_url as image_url, p.submitted_at as created_at,
                h.name as hackathon_name, ARRAY[]::text[] as tags
         FROM projects p
         LEFT JOIN hackathons h ON p.hackathon_id = h.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = $1
         ORDER BY p.submitted_at DESC`,
        [req.user!.userId]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});// Create project
app.post('/api/projects', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, github_url, demo_url, image_url, tags, hackathon_id } = req.body;

    // Generate a unique blockchain_project_id
    const maxIdResult = await pool.query('SELECT MAX(blockchain_project_id) as max FROM projects');
    const nextId = (maxIdResult.rows[0]?.max || 0) + 1;

    const result = await pool.query(
      `INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nextId, hackathon_id || null, title, description, github_url, demo_url, image_url]
    );

    const projectId = result.rows[0].id;

    // Add creator as team member
    const isBlockchainUser = req.user!.isBlockchainUser || !!req.user!.walletAddress;
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, member_address, role)
       VALUES ($1, $2, $3, $4)`,
      [projectId, isBlockchainUser ? null : req.user!.userId, req.user!.walletAddress || null, 'Team Lead']
    );

    res.status(201).json({
      ...result.rows[0],
      title: result.rows[0].name,
      image_url: result.rows[0].video_url,
      tags: tags || []
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get single blockchain project by ID
app.get('/api/blockchain/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, h.name as hackathon_name, h.id as hackathon_id,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', pm.id,
                    'name', COALESCE(bu.full_name, CONCAT(SUBSTRING(pm.member_address, 1, 6), '...', SUBSTRING(pm.member_address FROM LENGTH(pm.member_address) - 3))),
                    'address', pm.member_address,
                    'role', pm.role
                  )
                ) FILTER (WHERE pm.member_address IS NOT NULL), 
                '[]'
              ) as team_members
       FROM projects p
       LEFT JOIN hackathons h ON p.hackathon_id = h.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN blockchain_users bu ON pm.member_address = bu.wallet_address
       WHERE p.blockchain_project_id = $1 AND pm.member_address IS NOT NULL
       GROUP BY p.id, h.name, h.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blockchain project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching blockchain project:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain project' });
  }
});

// Get single project by ID
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = req.query;
    
    // Input validation to prevent query parameter pollution
    if (typeof id !== 'string' || id.includes('=') || id.includes('&') || id.includes('?')) {
      console.error('❌ Invalid project ID format:', id);
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    
    // Check if blockchain mode is requested or default
    const useBlockchainMode = mode === 'blockchain' || process.env.DEFAULT_MODE === 'blockchain';
    
    if (useBlockchainMode && id.includes('-')) {
      console.log(`📱 Fetching project ${id} from smart contract...`);
      
      try {
        // Parse hackathonId-projectId format
        const [hackathonId, projectId] = id.split('-').map(Number);
        
        // Import blockchain functions
        const { getHackathonFromChain, getProjectsFromChain } = await import('../lib/blockchain.js');
        
        const hackathon = await getHackathonFromChain(hackathonId);
        const projects = await getProjectsFromChain(hackathonId);
        
        const project = projects.find((p: any) => p.id === projectId);
        
        if (!project) {
          return res.status(404).json({ error: 'Project not found on blockchain' });
        }
        
        const projectData = {
          id: `${hackathonId}-${projectId}`,
          blockchain_id: projectId,
          hackathon_id: hackathonId,
          hackathon_name: hackathon.name,
          name: project.name,
          description: project.description,
          github_url: project.githubUrl,
          demo_url: project.demoUrl,
          video_url: null,
          submitted_at: new Date(project.submissionTimestamp * 1000).toISOString(),
          is_public: true,
          tags: [],
          team_members: [{
            id: null,
            name: `Participant (${project.submitter.substring(0, 8)}...)`,
            role: 'Team Lead'
          }],
          submitter_address: project.submitter,
          project_type: 'blockchain'
        };
        
        res.json(projectData);
        
      } catch (blockchainError: any) {
        console.error(`❌ Blockchain error for project ${id}:`, blockchainError?.message);
        return res.status(404).json({ error: 'Project not found on blockchain' });
      }
    } else {
      // Database mode
      console.log(`🗄️ Fetching project ${id} from database...`);
      
      const result = await pool.query(
        `SELECT p.*, h.name as hackathon_name, h.id as hackathon_id,
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', u.id, 
                      'name', u.full_name,
                      'role', pm.role
                    )
                  ) FILTER (WHERE u.id IS NOT NULL), '[]'
                ) as team_members
         FROM projects p
         LEFT JOIN hackathons h ON p.hackathon_id = h.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         LEFT JOIN users u ON pm.user_id = u.id
         WHERE p.id = $1
         GROUP BY p.id, h.name, h.id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project
app.put('/api/projects/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, github_url, demo_url, video_url, tags } = req.body;

    // Verify user is a team member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user!.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to edit this project' });
    }

    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           github_url = COALESCE($3, github_url),
           demo_url = COALESCE($4, demo_url),
           video_url = COALESCE($5, video_url),
           tags = COALESCE($6, tags)
       WHERE id = $7
       RETURNING *`,
      [name, description, github_url, demo_url, video_url, tags, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Toggle project visibility
app.patch('/api/projects/:id/visibility', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;

    // Verify user is a team member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user!.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to modify this project' });
    }

    const result = await pool.query(
      'UPDATE projects SET is_public = $1 WHERE id = $2 RETURNING *',
      [is_public, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

// Check if user can score project
app.get('/api/projects/:id/can-score', authenticateUnified, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [CAN-SCORE] Project ID: ${id}, User: ${req.user!.userId}, Wallet: ${req.user!.walletAddress}`);
    
    // Check if user is a judge
    if (req.user!.role !== 'judge') {
      console.log(`❌ [CAN-SCORE] User role is ${req.user!.role}, not judge`);
      return res.status(403).json({ canScore: false, error: 'Only judges can score projects' });
    }

    // Get project's hackathon - check both database ID and blockchain project ID
    let projectQuery = 'SELECT id, hackathon_id FROM projects WHERE ';
    let queryParam = id;

    // Check if it's a numeric ID (database ID) or string ID (blockchain project ID)
    if (/^\d+$/.test(id)) {
      projectQuery += 'id = $1';
    } else {
      projectQuery += 'blockchain_project_id = $1';
    }

    const projectResult = await pool.query(projectQuery, [queryParam]);
    console.log(`🔍 [CAN-SCORE] Project query result:`, projectResult.rows);

    if (projectResult.rows.length === 0) {
      console.log(`❌ [CAN-SCORE] Project not found for ID: ${id}`);
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const projectId = project.id; // Use database ID for further queries
    const hackathonId = project.hackathon_id;
    console.log(`✅ [CAN-SCORE] Found project - DB ID: ${projectId}, Hackathon ID: ${hackathonId}`);

    if (!hackathonId) {
      console.log(`❌ [CAN-SCORE] No hackathon ID for project`);
      return res.json({ canScore: false, existingScore: null });
    }

    // Check if judge is assigned to this hackathon
    // For blockchain mode, hackathon data comes from smart contract
    const hackathonResult = await pool.query(
      'SELECT mode, blockchain_id FROM hackathons WHERE id = $1',
      [hackathonId]
    );
    console.log(`🔍 [CAN-SCORE] Hackathon result:`, hackathonResult.rows);
    
    // If no hackathon in database, assume it's a blockchain hackathon
    // and use the hackathon_id as blockchain_id
    const isBlockchainHackathon = hackathonResult.rows.length === 0 || hackathonResult.rows[0]?.mode === 'blockchain';
    const blockchainHackathonId = hackathonResult.rows.length === 0 ? hackathonId : hackathonResult.rows[0]?.blockchain_id;
    console.log(`🔍 [CAN-SCORE] Is blockchain hackathon: ${isBlockchainHackathon}, Blockchain ID: ${blockchainHackathonId}`);
    
    if (isBlockchainHackathon) {
      // For blockchain hackathons, check judges from smart contract
      try {
        const { getJudgesFromChain } = await import('../lib/blockchain.js');
        const contractJudges = await getJudgesFromChain(blockchainHackathonId);
        console.log(`🔍 [CAN-SCORE] Contract judges:`, contractJudges);
        
        const userWalletAddress = req.user!.walletAddress?.toLowerCase();
        console.log(`🔍 [CAN-SCORE] User wallet address: ${userWalletAddress}`);
        
        const isAuthorizedJudge = contractJudges.some((judge: any) => 
          judge.address?.toLowerCase() === userWalletAddress
        );
        console.log(`🔍 [CAN-SCORE] Is authorized judge: ${isAuthorizedJudge}`);
        
        if (!isAuthorizedJudge) {
          console.log(`❌ [CAN-SCORE] User not authorized to judge this hackathon`);
          return res.json({ canScore: false, existingScore: null });
        }
        console.log(`✅ [CAN-SCORE] User authorized as blockchain judge`);
      } catch (error) {
        console.error('❌ [CAN-SCORE] Error fetching judges from contract:', error);
        return res.json({ canScore: false, existingScore: null });
      }
    } else {
      // For regular hackathons, require explicit judge assignment in database
      console.log(`🔍 [CAN-SCORE] Checking database judge assignment for hackathon ${hackathonId}, judge ${req.user!.userId}`);
      const judgeCheck = await pool.query(
        'SELECT * FROM hackathon_judges WHERE hackathon_id = $1 AND judge_id = $2',
        [hackathonId, req.user!.userId]
      );
      console.log(`🔍 [CAN-SCORE] Database judge check result:`, judgeCheck.rows);

      if (judgeCheck.rows.length === 0) {
        console.log(`❌ [CAN-SCORE] User not assigned as judge in database`);
        return res.json({ canScore: false, existingScore: null });
      }
      console.log(`✅ [CAN-SCORE] User authorized as database judge`);
    }

    // Check for existing score (use database project ID)
    console.log(`🔍 [CAN-SCORE] Checking existing scores for project ${projectId}, judge ${req.user!.userId}`);
    const scoreResult = await pool.query(
      'SELECT * FROM scores WHERE project_id = $1 AND judge_id = $2',
      [projectId, req.user!.userId]
    );
    console.log(`🔍 [CAN-SCORE] Existing score:`, scoreResult.rows[0] || 'none');

    console.log(`✅ [CAN-SCORE] Final result: canScore=true`);
    res.json({
      canScore: true,
      existingScore: scoreResult.rows[0] || null
    });
  } catch (error) {
    console.error('Error checking score permission:', error);
    res.status(500).json({ error: 'Failed to check score permission' });
  }
});

// Get average score for a project
app.get('/api/projects/:id/average-score', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle both database ID and blockchain project ID
    let projectQuery = 'SELECT id FROM projects WHERE ';
    if (/^\d+$/.test(id)) {
      projectQuery += 'id = $1';
    } else {
      projectQuery += 'blockchain_project_id = $1';
    }

    const project = await pool.query(projectQuery, [id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectId = project.rows[0].id; // Use database ID

    const result = await pool.query(
      `SELECT AVG(total_score) as average_score, COUNT(*) as judge_count
       FROM scores
       WHERE project_id = $1`,
      [projectId]
    );

    const avgScore = result.rows[0].average_score;
    const judgeCount = parseInt(result.rows[0].judge_count);

    res.json({
      average_score: avgScore ? parseFloat(avgScore) : null,
      judge_count: judgeCount
    });
  } catch (error) {
    console.error('Error fetching average score:', error);
    res.status(500).json({ error: 'Failed to fetch average score' });
  }
});

// Get user's registrations
app.get('/api/users/me/registrations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isBlockchainUser = !!req.user!.walletAddress;
    
    let result;
    if (isBlockchainUser) {
      // Fetch from blockchain_registrations
      result = await pool.query(
        `SELECT r.*, NULL as hackathon_name, NULL as start_date, NULL as end_date, 
                NULL as status, NULL as total_prize_pool
         FROM blockchain_registrations r
         WHERE r.user_id = $1
         ORDER BY r.registered_at DESC`,
        [req.user!.userId]
      );
    } else {
      // Fetch from regular registrations
      result = await pool.query(
        `SELECT r.*, h.name as hackathon_name, h.start_date, h.end_date, 
                h.status, h.total_prize_pool
         FROM registrations r
         LEFT JOIN hackathons h ON r.hackathon_id = h.id
         WHERE r.user_id = $1
         ORDER BY r.registered_at DESC`,
        [req.user!.userId]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get organizer's hackathons
app.get('/api/users/me/hackathons', authenticateUnified, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Organizer hackathons endpoint called');
    console.log('User:', req.user);
    console.log('Is blockchain user:', !!req.user!.walletAddress);
    
    const isBlockchainUser = !!req.user!.walletAddress;
    
    if (isBlockchainUser) {
      // Blockchain mode: fetch from smart contract
      console.log('📱 Using blockchain mode for organizer hackathons');
      console.log('Organizer wallet:', req.user!.walletAddress);
      
      try {
        // Import blockchain functions
        const { getHackathonCountFromChain, getHackathonFromChain, getProjectsFromChain, getPrizesFromChain } = await import('../lib/blockchain.js');
        
        console.log('Fetching hackathons from smart contract...');
        const hackathonCount = await getHackathonCountFromChain();
        console.log(`📊 Total hackathons on chain: ${hackathonCount}`);
        
        const organizer = req.user!.walletAddress!.toLowerCase();
        const organizerHackathons: any[] = [];
        
        // Check each hackathon to see if this user is the organizer
        for (let i = 1; i <= hackathonCount; i++) {
          try {
            const hackathon = await getHackathonFromChain(i);
            console.log(`🔍 Checking hackathon ${i}:`, {
              title: hackathon.name,
              organizer: hackathon.organizer,
              currentUser: organizer
            });
            
            if (hackathon.organizer.toLowerCase() === organizer) {
              console.log(`✅ Found organizer hackathon: ${hackathon.name}`);
              
              // Get project count for this hackathon
              let projectCount = 0;
              try {
                const projects = await getProjectsFromChain(i);
                projectCount = projects.length;
              } catch (error) {
                console.log(`ℹ️ No projects found for hackathon ${i}`);
                projectCount = 0;
              }
              
              // Get prizes for total prize pool calculation
              let totalPrizePool = 0;
              try {
                const prizes = await getPrizesFromChain(i);
                if (prizes && prizes.length > 0) {
                  totalPrizePool = prizes.reduce((sum: number, prize: any) => sum + Number(prize.amount), 0);
                } else {
                  // Fall back to total prize pool from hackathon if no individual prizes
                  totalPrizePool = hackathon.prizePoolWei ? Number(hackathon.prizePoolWei) / 1e18 : 0;
                }
              } catch (error) {
                // Fall back to total prize pool from hackathon
                totalPrizePool = hackathon.prizePoolWei ? Number(hackathon.prizePoolWei) / 1e18 : 0;
              }
              
              organizerHackathons.push({
                id: i,
                blockchain_id: i,
                name: hackathon.name,
                description: hackathon.description,
                start_date: new Date(Number(hackathon.startDate) * 1000).toISOString(),
                end_date: new Date(Number(hackathon.endDate) * 1000).toISOString(),
                registration_deadline: new Date(Number(hackathon.registrationDeadline) * 1000).toISOString(),
                organizer_address: hackathon.organizer,
                total_prize_pool: totalPrizePool.toString(),
                max_participants: Number(hackathon.maxParticipants || 0),
                status: Number(hackathon.endDate) * 1000 > Date.now() ? 'active' : 'completed',
                participant_count: 0, // Contract doesn't track this separately
                project_count: projectCount,
                created_at: new Date(Number(hackathon.startDate) * 1000).toISOString(),
                hackathon_type: 'blockchain'
              });
            }
          } catch (hackathonError: any) {
            console.log(`⚠️ Error fetching hackathon ${i}:`, hackathonError?.message || hackathonError);
          }
        }
        
        console.log(`✅ Found ${organizerHackathons.length} hackathons for organizer`);
        res.json(organizerHackathons);
        
      } catch (blockchainError: any) {
        console.error('❌ Blockchain error:', blockchainError?.message || blockchainError);
        res.status(500).json({ error: 'Failed to fetch hackathons from blockchain' });
      }
    } else {
      // Database mode: fetch from PostgreSQL
      console.log('🗄️ Fetching hackathons from database for organizer ID:', req.user!.userId);
      
      const result = await pool.query(
        `SELECT h.*, 
          (SELECT COUNT(*) FROM registrations WHERE hackathon_id = h.id) as participant_count,
          (SELECT COUNT(*) FROM projects WHERE hackathon_id = h.id) as project_count
         FROM hackathons h
         WHERE h.organizer_id = $1
         ORDER BY h.start_date DESC`,
        [req.user!.userId]
      );

      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching organizer hackathons:', error);
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

// Get judge's assigned hackathons
app.get('/api/users/me/judge-hackathons', authenticateUnified, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Judge hackathons endpoint called');
    console.log('User:', req.user);
    console.log('Is blockchain user:', !!req.user!.walletAddress);
    
    const isBlockchainUser = !!req.user!.walletAddress;
    
    if (isBlockchainUser) {
      console.log('Using blockchain mode for judge hackathons');
      
      const walletAddress = req.user!.walletAddress!;
      console.log('Blockchain judge wallet:', walletAddress);
      
      try {
        // Import blockchain functions
        const { getHackathonsForJudge, getHackathonFromChain } = await import('../lib/blockchain.js');
        
        console.log('Fetching hackathons from smart contract...');
        
        // Get hackathon IDs where this judge is assigned (much more efficient!)
        const assignedHackathonIds = await getHackathonsForJudge(walletAddress);
        console.log(`Found ${assignedHackathonIds.length} assigned hackathons for judge:`, assignedHackathonIds);
        
        const assignedHackathons: any[] = [];
        
        // Get details for each assigned hackathon
        for (const hackathonId of assignedHackathonIds) {
          try {
            console.log(`Fetching details for hackathon ${hackathonId}...`);
            const hackathon = await getHackathonFromChain(hackathonId);
            
            // Transform contract data to match expected format
            const hackathonData = {
              id: hackathonId,
              name: hackathon.name,
              description: hackathon.description,
              organizer: hackathon.organizer,
              start_date: new Date(hackathon.startDate * 1000).toISOString(),
              end_date: new Date(hackathon.endDate * 1000).toISOString(),
              registration_deadline: new Date(hackathon.registrationDeadline * 1000).toISOString(),
              status: hackathon.active ? 'ongoing' : 'completed',
              total_prize_pool: hackathon.prizePoolWei.toString(),
              project_count: hackathon.projectCount,
              judge_count: hackathon.judgeCount,
              assigned_at: null, // Contract doesn't store assignment timestamp
              hackathon_type: 'blockchain'
            };
            
            assignedHackathons.push(hackathonData);
            console.log(`✅ Added hackathon: ${hackathon.name}`);
          } catch (hackathonError: any) {
            console.warn(`Error fetching hackathon ${hackathonId}:`, hackathonError?.message || hackathonError);
          }
        }
        
        console.log(`Returning ${assignedHackathons.length} hackathons for blockchain judge ${walletAddress}`);
        res.json(assignedHackathons);
        
      } catch (blockchainError: any) {
        console.error('Smart contract interaction failed:', blockchainError);
        
        // Return a meaningful error message
        res.status(500).json({ 
          error: 'Failed to fetch hackathons from blockchain', 
          details: blockchainError?.message || blockchainError,
          suggestion: 'Smart contract might not be deployed or accessible'
        });
      }
    } else {
      console.log('Using database mode for judge hackathons');
      // Traditional database mode
      const result = await pool.query(
        `SELECT h.*, hj.assigned_at,
          (SELECT COUNT(*) FROM projects WHERE hackathon_id = h.id) as project_count,
          (SELECT COUNT(*) FROM scores s WHERE s.judge_id = $1 AND s.project_id IN 
            (SELECT id FROM projects WHERE hackathon_id = h.id)) as scored_count
         FROM hackathons h
         JOIN hackathon_judges hj ON h.id = hj.hackathon_id
         WHERE hj.judge_id = $1
         ORDER BY h.start_date DESC`,
        [req.user!.userId]
      );

      console.log(`Found ${result.rows.length} hackathons for database judge`);
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching judge hackathons:', error);
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

// Get projects to judge for a hackathon
app.get('/api/hackathons/:id/projects-to-judge', authenticate, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify judge is assigned to this hackathon
    const assigned = await pool.query(
      'SELECT * FROM hackathon_judges WHERE hackathon_id = $1 AND judge_id = $2',
      [id, req.user!.userId]
    );

    if (assigned.rows.length === 0) {
      return res.status(403).json({ error: 'Not assigned to this hackathon' });
    }

    const result = await pool.query(
      `SELECT p.*, 
        ARRAY_AGG(DISTINCT u.full_name) as team_members,
        COALESCE(s.technical_score, 0) as technical_score,
        COALESCE(s.innovation_score, 0) as innovation_score,
        COALESCE(s.presentation_score, 0) as presentation_score,
        COALESCE(s.impact_score, 0) as impact_score,
        COALESCE(s.total_score, 0) as my_score,
        s.feedback as my_feedback,
        s.scored_at as my_scored_at
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       LEFT JOIN scores s ON p.id = s.project_id AND s.judge_id = $2
       WHERE p.hackathon_id = $1
       GROUP BY p.id, s.technical_score, s.innovation_score, s.presentation_score, 
                s.impact_score, s.total_score, s.feedback, s.scored_at
       ORDER BY p.submitted_at DESC`,
      [id, req.user!.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects to judge:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Submit or update score for a project
// Submit score for a project (updated to support blockchain mode)
app.post('/api/projects/:id/score', authenticate, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { technical_score, innovation_score, presentation_score, impact_score, feedback } = req.body;
    const isBlockchainUser = !!req.user!.walletAddress;

    // Verify project exists - handle both database ID and blockchain project ID
    let projectQuery = 'SELECT id, hackathon_id FROM projects WHERE ';
    if (/^\d+$/.test(id)) {
      projectQuery += 'id = $1';
    } else {
      projectQuery += 'blockchain_project_id = $1';
    }

    const project = await pool.query(projectQuery, [id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectId = project.rows[0].id; // Use database ID for scoring
    const hackathonId = project.rows[0].hackathon_id;

    // For blockchain judges, allow scoring active/ongoing hackathons
    // For database judges, check explicit assignment
    if (!isBlockchainUser) {
      const assigned = await pool.query(
        'SELECT * FROM hackathon_judges WHERE hackathon_id = $1 AND judge_id = $2',
        [hackathonId, req.user!.userId]
      );

      if (assigned.rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized to score this project' });
      }
    } else {
      // For blockchain judges, check if hackathon is active/ongoing
      const hackathon = await pool.query(
        'SELECT status FROM hackathons WHERE id = $1',
        [hackathonId]
      );

      if (hackathon.rows.length === 0 || 
          !['active', 'ongoing', 'upcoming'].includes(hackathon.rows[0].status)) {
        return res.status(403).json({ error: 'This hackathon is not available for scoring' });
      }
    }

    let judgeAddress = null;
    if (isBlockchainUser) {
      judgeAddress = req.user!.walletAddress;
    } else {
      // Get judge's wallet address for database users
      const judge = await pool.query('SELECT wallet_address FROM users WHERE id = $1', [req.user!.userId]);
      judgeAddress = judge.rows[0]?.wallet_address;
    }

    // Insert or update score
    const result = await pool.query(
      `INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, 
                          presentation_score, impact_score, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (project_id, judge_id)
       DO UPDATE SET 
         technical_score = EXCLUDED.technical_score,
         innovation_score = EXCLUDED.innovation_score,
         presentation_score = EXCLUDED.presentation_score,
         impact_score = EXCLUDED.impact_score,
         feedback = EXCLUDED.feedback,
         scored_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [projectId, req.user!.userId, judgeAddress, technical_score, innovation_score, 
       presentation_score, impact_score, feedback]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error scoring project:', error);
    res.status(500).json({ error: 'Failed to score project' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production info endpoint
app.get('/info', (req: Request, res: Response) => {
  res.json({ 
    name: 'Hackathon Platform API',
    version: '1.0.1',
    mode: process.env.DEFAULT_MODE || 'database',
    blockchain: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? 'enabled' : 'disabled',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`⛓️  Blockchain mode: ${process.env.DEFAULT_MODE || 'database'}`);
  console.log(`📝 Contract: ${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set'}`);
});

export default app;

