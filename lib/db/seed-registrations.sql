-- Add registrations for hackers to show participant counts
INSERT INTO registrations (hackathon_id, user_id, status) VALUES
-- Web3 Innovation Summit (hackathon 1)
(1, 4, 'confirmed'),
(1, 5, 'confirmed'),
(1, 6, 'confirmed'),
-- AI & Blockchain (hackathon 2)  
(2, 4, 'confirmed'),
(2, 5, 'confirmed'),
(2, 6, 'confirmed'),
-- DeFi Development Challenge (hackathon 3)
(3, 4, 'confirmed'),
(3, 5, 'confirmed'),
(3, 6, 'confirmed')
ON CONFLICT (hackathon_id, user_id) DO NOTHING;
