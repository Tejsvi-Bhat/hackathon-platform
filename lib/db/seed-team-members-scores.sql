-- Create participant1@test.com user if not exists
INSERT INTO users (wallet_address, email, password_hash, full_name, role, created_at)
VALUES (
  '0x7777777890123456789012345678901234567890',
  'participant1@test.com',
  '$2b$10$abcdefghijklmnopqrstuv', -- dummy hash
  'Sarah Participant',
  'hacker', -- role must be organizer, judge, or hacker
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Create additional participant users
INSERT INTO users (wallet_address, email, password_hash, full_name, role, created_at)
VALUES 
  ('0x8888888901234567890123456789012345678901', 'participant2@test.com', '$2b$10$abcdefghijklmnopqrstuv', 'Mike Developer', 'hacker', CURRENT_TIMESTAMP),
  ('0x9999999012345678901234567890123456789012', 'participant3@test.com', '$2b$10$abcdefghijklmnopqrstuv', 'Lisa Engineer', 'hacker', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Add team members to existing projects
-- Project 1: DeFi Lending Protocol (hackathon 3)
INSERT INTO project_members (project_id, user_id, member_address, role, joined_at)
VALUES
  (1, (SELECT id FROM users WHERE email = 'participant1@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant1@test.com'), 'Team Lead', CURRENT_TIMESTAMP),
  (1, (SELECT id FROM users WHERE email = 'hacker1@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker1@test.com'), 'Backend Developer', CURRENT_TIMESTAMP),
  (1, (SELECT id FROM users WHERE email = 'hacker2@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker2@test.com'), 'Smart Contract Developer', CURRENT_TIMESTAMP)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 2: DEX Aggregator (hackathon 3)
INSERT INTO project_members (project_id, user_id, member_address, role, joined_at)
VALUES
  (2, (SELECT id FROM users WHERE email = 'participant2@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant2@test.com'), 'Team Lead', CURRENT_TIMESTAMP),
  (2, (SELECT id FROM users WHERE email = 'hacker3@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker3@test.com'), 'Frontend Developer', CURRENT_TIMESTAMP),
  (2, (SELECT id FROM users WHERE email = 'participant3@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant3@test.com'), 'UI/UX Designer', CURRENT_TIMESTAMP)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add more projects to hackathon 3 for better leaderboard
INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url, submitted_at, tags)
VALUES
  (9, 3, 'Yield Farming Protocol', 'Automated yield optimization across multiple DeFi protocols', 'https://github.com/example/yield-farm', 'https://yield-demo.example.com', '2025-10-03 06:00:00', ARRAY['DeFi', 'Yield', 'Web3']),
  (10, 3, 'Flash Loan Arbitrage', 'Smart contract for flash loan arbitrage opportunities', 'https://github.com/example/flash-loan', 'https://flash-demo.example.com', '2025-10-03 05:30:00', ARRAY['DeFi', 'Arbitrage', 'Smart Contracts']),
  (11, 3, 'Stablecoin Manager', 'Multi-chain stablecoin portfolio management', 'https://github.com/example/stablecoin', 'https://stable-demo.example.com', '2025-10-03 07:00:00', ARRAY['DeFi', 'Stablecoin', 'Multi-chain'])
ON CONFLICT (blockchain_project_id) DO NOTHING;

-- Add team members to new projects
-- Project 9: Yield Farming Protocol
INSERT INTO project_members (project_id, user_id, member_address, role, joined_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Yield Farming Protocol'), (SELECT id FROM users WHERE email = 'hacker1@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker1@test.com'), 'Team Lead', CURRENT_TIMESTAMP),
  ((SELECT id FROM projects WHERE name = 'Yield Farming Protocol'), (SELECT id FROM users WHERE email = 'participant1@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant1@test.com'), 'Smart Contract Dev', CURRENT_TIMESTAMP)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 10: Flash Loan Arbitrage
INSERT INTO project_members (project_id, user_id, member_address, role, joined_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Flash Loan Arbitrage'), (SELECT id FROM users WHERE email = 'hacker2@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker2@test.com'), 'Team Lead', CURRENT_TIMESTAMP),
  ((SELECT id FROM projects WHERE name = 'Flash Loan Arbitrage'), (SELECT id FROM users WHERE email = 'participant2@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant2@test.com'), 'Backend Developer', CURRENT_TIMESTAMP)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 11: Stablecoin Manager
INSERT INTO project_members (project_id, user_id, member_address, role, joined_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Stablecoin Manager'), (SELECT id FROM users WHERE email = 'hacker3@test.com'), (SELECT wallet_address FROM users WHERE email = 'hacker3@test.com'), 'Team Lead', CURRENT_TIMESTAMP),
  ((SELECT id FROM projects WHERE name = 'Stablecoin Manager'), (SELECT id FROM users WHERE email = 'participant3@test.com'), (SELECT wallet_address FROM users WHERE email = 'participant3@test.com'), 'Frontend Developer', CURRENT_TIMESTAMP)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add more judges to hackathon 3 for scoring
INSERT INTO hackathon_judges (hackathon_id, judge_id, judge_address, assigned_at)
VALUES
  (3, (SELECT id FROM users WHERE email = 'judge2@test.com'), '0xABCDEF1234567890123456789012345678901234', CURRENT_TIMESTAMP)
ON CONFLICT (hackathon_id, judge_id) DO NOTHING;

-- Seed scores for all projects in hackathon 3
-- Project 1: DeFi Lending Protocol - HIGH SCORES (Winner)
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback, scored_at)
VALUES
  -- Judge 1 (Bob Judge - id 2)
  (1, 2, (SELECT wallet_address FROM users WHERE id = 2), 92, 88, 85, 90, 'Excellent implementation of lending mechanics with innovative collateral management. Great security practices.', '2025-10-04 10:00:00'),
  -- Judge 2 (Carol Judge - id 3)
  (1, 3, (SELECT wallet_address FROM users WHERE id = 3), 88, 90, 87, 92, 'Outstanding work! The protocol design is solid and the user experience is smooth. Strong potential for real-world adoption.', '2025-10-04 11:30:00')
ON CONFLICT (project_id, judge_id) DO NOTHING;

-- Project 2: DEX Aggregator - MEDIUM-HIGH SCORES (Second Place)
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback, scored_at)
VALUES
  (2, 2, (SELECT wallet_address FROM users WHERE id = 2), 85, 82, 88, 80, 'Good aggregator logic with nice UI. Could improve on gas optimization and add more DEX integrations.', '2025-10-04 10:30:00'),
  (2, 3, (SELECT wallet_address FROM users WHERE id = 3), 83, 85, 86, 82, 'Solid execution with good design. The routing algorithm is efficient. Would like to see multi-chain support.', '2025-10-04 12:00:00')
ON CONFLICT (project_id, judge_id) DO NOTHING;

-- Project 9: Yield Farming Protocol - MEDIUM SCORES (Third Place)
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback, scored_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Yield Farming Protocol'), 2, (SELECT wallet_address FROM users WHERE id = 2), 78, 80, 75, 82, 'Good yield optimization strategy. The auto-compounding feature is nice. Needs better documentation.', '2025-10-04 11:00:00'),
  ((SELECT id FROM projects WHERE name = 'Yield Farming Protocol'), 3, (SELECT wallet_address FROM users WHERE id = 3), 80, 78, 77, 80, 'Decent implementation with useful features. Risk management could be improved. Good potential.', '2025-10-04 12:30:00')
ON CONFLICT (project_id, judge_id) DO NOTHING;

-- Project 10: Flash Loan Arbitrage - MEDIUM-LOW SCORES
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback, scored_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Flash Loan Arbitrage'), 2, (SELECT wallet_address FROM users WHERE id = 2), 72, 70, 68, 75, 'Interesting concept but execution needs work. The arbitrage detection could be more sophisticated.', '2025-10-04 11:30:00'),
  ((SELECT id FROM projects WHERE name = 'Flash Loan Arbitrage'), 3, (SELECT wallet_address FROM users WHERE id = 3), 70, 72, 70, 73, 'Basic implementation of flash loans. Good start but needs refinement in profitability calculations.', '2025-10-04 13:00:00')
ON CONFLICT (project_id, judge_id) DO NOTHING;

-- Project 11: Stablecoin Manager - MEDIUM SCORES
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback, scored_at)
VALUES
  ((SELECT id FROM projects WHERE name = 'Stablecoin Manager'), 2, (SELECT wallet_address FROM users WHERE id = 2), 75, 77, 80, 78, 'Clean UI and good UX for managing stablecoins. Multi-chain support is a plus. Could add more analytics.', '2025-10-04 12:00:00'),
  ((SELECT id FROM projects WHERE name = 'Stablecoin Manager'), 3, (SELECT wallet_address FROM users WHERE id = 3), 77, 75, 82, 76, 'Well-designed interface with practical features. The portfolio tracking is useful. Good work overall.', '2025-10-04 13:30:00')
ON CONFLICT (project_id, judge_id) DO NOTHING;

-- Verify the seeded data
SELECT 'Team members seeded for projects' as status;
SELECT p.name, COUNT(pm.user_id) as team_size
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.hackathon_id = 3
GROUP BY p.id, p.name
ORDER BY p.id;

SELECT 'Scores seeded for hackathon 3' as status;
SELECT p.name, 
       ROUND(AVG(s.total_score), 1) as avg_score,
       COUNT(s.id) as num_judges
FROM projects p
LEFT JOIN scores s ON p.id = s.project_id
WHERE p.hackathon_id = 3
GROUP BY p.id, p.name
ORDER BY avg_score DESC NULLS LAST;
