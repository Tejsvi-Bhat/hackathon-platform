-- Update total_prize_pool for each hackathon by summing up prize amounts
UPDATE hackathons h
SET total_prize_pool = COALESCE((
    SELECT SUM(amount)::integer
    FROM prizes p
    WHERE p.hackathon_id = h.id
), 0);

-- Seed registrations (participants) for hackathons
-- Get the hacker user IDs first (Tejsvi Hacker1, Hacker2, Hacker3)
-- Register all hackers to ongoing hackathons (AI & Blockchain Hackathon)
INSERT INTO registrations (hackathon_id, user_id, status) VALUES
-- AI & Blockchain Hackathon (id 2 - ongoing)
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'), 
 'confirmed'),

-- DeFi Development Challenge (id 3 - completed)
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'), 
 'confirmed'),

-- GameFi Revolution Hackathon (id 4 - completed)
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'), 
 'confirmed'),
 
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'), 
 'confirmed');

-- Verify the updates
SELECT name, total_prize_pool, 
       (SELECT COUNT(*) FROM registrations WHERE hackathon_id = hackathons.id) as participant_count
FROM hackathons 
ORDER BY id;
