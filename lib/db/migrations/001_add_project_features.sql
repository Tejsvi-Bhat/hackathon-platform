-- Migration: Add features for project management and judging system

-- Add is_public column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add evaluation_criteria to prizes table (stored as JSON text for flexibility)
ALTER TABLE prizes 
ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT;

-- Create hackathon_faqs table if it doesn't exist
CREATE TABLE IF NOT EXISTS hackathon_faqs (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add additional fields to hackathons table for new features
ALTER TABLE hackathons
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS ecosystem VARCHAR(100),
ADD COLUMN IF NOT EXISTS tech_stack TEXT[],
ADD COLUMN IF NOT EXISTS level VARCHAR(50),
ADD COLUMN IF NOT EXISTS mode VARCHAR(50),
ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_prize_pool DECIMAL(20, 2) DEFAULT 0;

-- Add prize_id reference to scores table to track which prize category a score is for
ALTER TABLE scores
ADD COLUMN IF NOT EXISTS prize_id INTEGER REFERENCES prizes(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_hackathon_faqs_hackathon ON hackathon_faqs(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_scores_prize ON scores(prize_id);
