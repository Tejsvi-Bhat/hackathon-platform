-- Create database schema for Hackathon Platform

-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'judge', 'hacker')),
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hackathons table (synced with blockchain)
CREATE TABLE hackathons (
    id SERIAL PRIMARY KEY,
    blockchain_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organizer_address VARCHAR(42) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    is_active BOOLEAN DEFAULT TRUE,
    banner_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prizes table
CREATE TABLE prizes (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    blockchain_prize_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(20, 2) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule/Events table
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    blockchain_schedule_id INTEGER NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    event_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Judges mapping
CREATE TABLE hackathon_judges (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    judge_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    judge_address VARCHAR(42) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hackathon_id, judge_id)
);

-- Projects/Submissions table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    blockchain_project_id INTEGER UNIQUE NOT NULL,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    video_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members for projects
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    member_address VARCHAR(42) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Scores table (synced with blockchain)
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    judge_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    judge_address VARCHAR(42) NOT NULL,
    technical_score INTEGER CHECK (technical_score >= 0 AND technical_score <= 100),
    innovation_score INTEGER CHECK (innovation_score >= 0 AND innovation_score <= 100),
    presentation_score INTEGER CHECK (presentation_score >= 0 AND presentation_score <= 100),
    impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
    total_score INTEGER GENERATED ALWAYS AS (technical_score + innovation_score + presentation_score + impact_score) STORED,
    feedback TEXT,
    scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, judge_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hackathon_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_organizer ON hackathons(organizer_id);
CREATE INDEX idx_projects_hackathon ON projects(hackathon_id);
CREATE INDEX idx_scores_project ON scores(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_registrations_hackathon ON registrations(hackathon_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
