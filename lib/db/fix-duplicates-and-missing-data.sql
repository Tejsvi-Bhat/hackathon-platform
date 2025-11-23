-- 1. Delete duplicate schedules (keep the ones with lower IDs)
DELETE FROM schedules a
USING schedules b
WHERE a.id > b.id 
  AND a.hackathon_id = b.hackathon_id 
  AND a.blockchain_schedule_id = b.blockchain_schedule_id;

-- 2. Add missing columns to prizes table
ALTER TABLE prizes 
ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'General Prize',
ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT,
ADD COLUMN IF NOT EXISTS voting_type VARCHAR(50) DEFAULT 'judges';

-- 3. Update prizes with evaluation criteria based on position
UPDATE prizes 
SET 
  category = CASE position
    WHEN 1 THEN 'Innovation Excellence'
    WHEN 2 THEN 'Technical Achievement'
    WHEN 3 THEN 'Best Implementation'
    ELSE 'Special Prize'
  END,
  evaluation_criteria = CASE position
    WHEN 1 THEN 'Originality of idea, technical innovation, real-world impact potential, scalability'
    WHEN 2 THEN 'Code quality, technical complexity, architecture design, security best practices'
    WHEN 3 THEN 'User experience, practical application, problem-solving approach, presentation quality'
    ELSE 'Overall contribution to the ecosystem'
  END,
  voting_type = 'judges';

-- 4. Seed judges for all hackathons (using Judge1 and Judge2)
INSERT INTO hackathon_judges (hackathon_id, user_id) VALUES
-- Web3 Innovation Summit
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- AI & Blockchain Hackathon
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- DeFi Development Challenge
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- GameFi Revolution Hackathon
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- Climate Tech Web3 Challenge
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- NFT Marketplace Builder Sprint
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2')),

-- DeFi Security Audit Hackathon
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge1')),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Judge2'));

-- 5. Verify the fixes
SELECT 'Schedules remaining:' as check_type, COUNT(*) as count FROM schedules
UNION ALL
SELECT 'Duplicate schedules:', COUNT(*) FROM (
  SELECT hackathon_id, blockchain_schedule_id, COUNT(*) 
  FROM schedules 
  GROUP BY hackathon_id, blockchain_schedule_id 
  HAVING COUNT(*) > 1
) dups
UNION ALL
SELECT 'Prizes with criteria:', COUNT(*) FROM prizes WHERE evaluation_criteria IS NOT NULL
UNION ALL
SELECT 'Total judges:', COUNT(*) FROM hackathon_judges
UNION ALL
SELECT 'Hackathons with judges:', COUNT(DISTINCT hackathon_id) FROM hackathon_judges;
