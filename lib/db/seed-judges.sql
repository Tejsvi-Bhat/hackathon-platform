-- Seed judges for all hackathons (using Judge1 and Judge2)
INSERT INTO hackathon_judges (hackathon_id, judge_id, judge_address) VALUES
-- Web3 Innovation Summit
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 37, '0xJudge2'),

-- AI & Blockchain Hackathon
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 37, '0xJudge2'),

-- DeFi Development Challenge
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 37, '0xJudge2'),

-- GameFi Revolution Hackathon
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 37, '0xJudge2'),

-- Climate Tech Web3 Challenge
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 37, '0xJudge2'),

-- NFT Marketplace Builder Sprint
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 37, '0xJudge2'),

-- DeFi Security Audit Hackathon
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 36, '0xJudge1'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 37, '0xJudge2');

-- Verify judges were added
SELECT h.name, COUNT(hj.id) as judge_count, STRING_AGG(u.full_name, ', ') as judges
FROM hackathons h
LEFT JOIN hackathon_judges hj ON h.id = hj.hackathon_id
LEFT JOIN users u ON hj.judge_id = u.id
GROUP BY h.name
ORDER BY h.name;
