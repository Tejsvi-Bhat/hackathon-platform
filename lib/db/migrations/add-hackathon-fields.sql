-- Add additional fields to hackathons table for enhanced UI
ALTER TABLE hackathons
ADD COLUMN IF NOT EXISTS ecosystem VARCHAR(100),
ADD COLUMN IF NOT EXISTS tech_stack TEXT[],
ADD COLUMN IF NOT EXISTS level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
ADD COLUMN IF NOT EXISTS mode VARCHAR(20) CHECK (mode IN ('online', 'offline', 'hybrid')),
ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_prize_pool DECIMAL(20, 2);

-- Update existing hackathons with sample data
UPDATE hackathons SET
  ecosystem = 'Ethereum',
  tech_stack = ARRAY['Solidity', 'React', 'Node.js'],
  level = 'all',
  mode = 'hybrid',
  max_team_size = 5,
  registration_deadline = start_date - INTERVAL '7 days',
  is_featured = TRUE,
  total_prize_pool = 50000
WHERE id = 1;

UPDATE hackathons SET
  ecosystem = 'Polygon',
  tech_stack = ARRAY['Python', 'TensorFlow', 'Solidity'],
  level = 'intermediate',
  mode = 'online',
  max_team_size = 4,
  registration_deadline = start_date - INTERVAL '5 days',
  is_featured = TRUE,
  total_prize_pool = 30000
WHERE id = 2;

UPDATE hackathons SET
  ecosystem = 'Binance Smart Chain',
  tech_stack = ARRAY['Solidity', 'Web3.js', 'React'],
  level = 'advanced',
  mode = 'online',
  max_team_size = 5,
  registration_deadline = start_date - INTERVAL '3 days',
  is_featured = TRUE,
  total_prize_pool = 75000
WHERE id = 3;
