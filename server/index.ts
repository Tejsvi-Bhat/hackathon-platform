import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import pool from '../lib/db/index.js';
import { generateToken } from '../lib/auth.js';
import { authenticate, authorize, AuthRequest } from '../lib/middleware.js';

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
    const { status } = req.query;
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
    
    const result = await pool.query(
      'SELECT * FROM registrations WHERE hackathon_id = $1 AND user_id = $2',
      [id, req.user!.userId]
    );
    
    res.json({ isRegistered: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({ error: 'Failed to check registration' });
  }
});

// Register for hackathon
app.post('/api/hackathons/:id/register', authenticate, authorize('hacker'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `INSERT INTO registrations (hackathon_id, user_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (hackathon_id, user_id) DO NOTHING
       RETURNING *`,
      [id, req.user!.userId, 'confirmed']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Already registered' });
    }

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, hackathon_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.userId, id, 'Registration Confirmed', 'Your registration has been confirmed!', 'registration']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// ============ PROJECT ROUTES ============

// Submit project
app.post('/api/projects', authenticate, authorize('hacker'), async (req: AuthRequest, res: Response) => {
  try {
    const { hackathonId, name, description, githubUrl, demoUrl, videoUrl, blockchainProjectId, teamMemberIds } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [blockchainProjectId, hackathonId, name, description, githubUrl, demoUrl, videoUrl]
    );

    const project = result.rows[0];

    // Add team members
    const memberIds = [req.user!.userId, ...(teamMemberIds || [])];
    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      const member = await pool.query('SELECT wallet_address FROM users WHERE id = $1', [memberId]);
      
      if (member.rows.length > 0) {
        await pool.query(
          `INSERT INTO project_members (project_id, user_id, member_address, role)
           VALUES ($1, $2, $3, $4)`,
          [project.id, memberId, member.rows[0].wallet_address, i === 0 ? 'team lead' : 'member']
        );
      }
    }

    // Create notification
    await pool.query(
      `INSERT INTO notifications (user_id, hackathon_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user!.userId, hackathonId, 'Project Submitted', `Your project "${name}" has been submitted successfully!`, 'submission']
    );

    res.status(201).json(project);
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

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

// Get single project
app.get('/api/projects/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      `SELECT p.*, 
        json_agg(json_build_object(
          'userId', u.id,
          'fullName', u.full_name,
          'walletAddress', u.wallet_address,
          'role', pm.role
        )) as team_members
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Get scores if released or if user is organizer/judge
    const scoresResult = await pool.query(
      `SELECT s.*, u.full_name as judge_name
       FROM scores s
       JOIN users u ON s.judge_id = u.id
       WHERE s.project_id = $1`,
      [id]
    );

    project.scores = scoresResult.rows;

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ============ SCORING ROUTES ============

// Score project (judges only)
app.post('/api/projects/:id/score', authenticate, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { technicalScore, innovationScore, presentationScore, impactScore, feedback } = req.body;

    // Verify project exists and judge is assigned
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hackathonId = project.rows[0].hackathon_id;
    const isJudge = await pool.query(
      'SELECT * FROM hackathon_judges WHERE hackathon_id = $1 AND judge_id = $2',
      [hackathonId, req.user!.userId]
    );

    if (isJudge.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to judge this hackathon' });
    }

    const result = await pool.query(
      `INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback)
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
      [id, req.user!.userId, req.user!.walletAddress, technicalScore, innovationScore, presentationScore, impactScore, feedback]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error scoring project:', error);
    res.status(500).json({ error: 'Failed to score project' });
  }
});

// Get leaderboard
app.get('/api/hackathons/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.github_url,
        p.demo_url,
        json_agg(DISTINCT jsonb_build_object(
          'userId', u.id,
          'fullName', u.full_name
        )) as team_members,
        COALESCE(AVG(s.total_score), 0) as average_score,
        COUNT(DISTINCT s.id) as judge_count,
        RANK() OVER (ORDER BY AVG(s.total_score) DESC) as rank
       FROM projects p
       LEFT JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN users u ON pm.user_id = u.id
       LEFT JOIN scores s ON p.id = s.project_id
       WHERE p.hackathon_id = $1
       GROUP BY p.id
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
app.get('/api/dashboard/stats', authenticate, async (req: AuthRequest, res: Response) => {
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
app.get('/api/dashboard/stats', authenticate, async (req: AuthRequest, res: Response) => {
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
    const result = await pool.query(
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
       GROUP BY p.id, h.name
       ORDER BY p.submitted_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get user's projects
app.get('/api/users/me/projects', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT p.id, p.name as title, p.description, p.github_url, 
              p.demo_url, p.video_url as image_url, p.submitted_at as created_at,
              h.name as hackathon_name, ARRAY[]::text[] as tags
       FROM projects p
       LEFT JOIN hackathons h ON p.hackathon_id = h.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.submitted_at DESC`,
      [req.user!.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
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
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [projectId, req.user!.userId, 'Team Lead']
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

// Get user's registrations
app.get('/api/users/me/registrations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*, h.name as hackathon_name, h.start_date, h.end_date, 
              h.status, h.total_prize_pool
       FROM registrations r
       JOIN hackathons h ON r.hackathon_id = h.id
       WHERE r.user_id = $1
       ORDER BY h.start_date DESC`,
      [req.user!.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get organizer's hackathons
app.get('/api/users/me/hackathons', authenticate, authorize('organizer'), async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error fetching organizer hackathons:', error);
    res.status(500).json({ error: 'Failed to fetch hackathons' });
  }
});

// Get judge's assigned hackathons
app.get('/api/users/me/judge-hackathons', authenticate, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
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

    res.json(result.rows);
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
app.post('/api/projects/:id/score', authenticate, authorize('judge'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { technical_score, innovation_score, presentation_score, impact_score, feedback } = req.body;

    // Verify project exists and judge is assigned to its hackathon
    const project = await pool.query('SELECT hackathon_id FROM projects WHERE id = $1', [id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const assigned = await pool.query(
      'SELECT * FROM hackathon_judges WHERE hackathon_id = $1 AND judge_id = $2',
      [project.rows[0].hackathon_id, req.user!.userId]
    );

    if (assigned.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to score this project' });
    }

    // Get judge's wallet address
    const judge = await pool.query('SELECT wallet_address FROM users WHERE id = $1', [req.user!.userId]);

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
      [id, req.user!.userId, judge.rows[0].wallet_address, technical_score, innovation_score, 
       presentation_score, impact_score, feedback]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
