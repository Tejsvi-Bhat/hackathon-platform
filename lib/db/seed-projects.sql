-- Seed Projects for ongoing and completed hackathons
-- Projects for AI & Blockchain Hackathon (ongoing - id 25)
INSERT INTO projects (hackathon_id, blockchain_project_id, name, description, github_url, demo_url) VALUES
-- AI & Blockchain Hackathon projects
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 1, 
 'SmartPredict AI',
 'An AI-powered prediction market platform that uses machine learning to analyze blockchain data and provide accurate market insights. Features real-time price predictions and sentiment analysis.',
 'https://github.com/hackathon/smartpredict-ai',
 'https://smartpredict-demo.vercel.app'),

((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 2, 
 'Neural DAO',
 'A decentralized autonomous organization governed by AI algorithms. The system uses neural networks to analyze proposals and vote on behalf of token holders based on historical data and preferences.',
 'https://github.com/hackathon/neural-dao',
 'https://neuraldao-demo.vercel.app'),

((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 
 3, 
 'ChainGuard AI',
 'AI-based smart contract auditing tool that automatically detects vulnerabilities and suggests fixes. Uses deep learning trained on thousands of audited contracts.',
 'https://github.com/hackathon/chainguard-ai',
 'https://chainguard-demo.vercel.app'),

-- DeFi Development Challenge projects (completed - id 26)
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 4, 
 'YieldOptimizer Pro',
 'Automated yield farming aggregator that finds the best APY across multiple DeFi protocols. Features auto-compounding and gas optimization.',
 'https://github.com/hackathon/yield-optimizer',
 'https://yieldoptimizer-demo.vercel.app'),

((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 5, 
 'FlashSwap DEX',
 'Next-generation decentralized exchange with flash loan integration and MEV protection. Lightning-fast swaps with minimal slippage.',
 'https://github.com/hackathon/flashswap-dex',
 'https://flashswap-demo.vercel.app'),

((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 
 6, 
 'StableVault',
 'Algorithmic stablecoin protocol with over-collateralized vaults and automatic liquidation protection. Supports multiple collateral types.',
 'https://github.com/hackathon/stablevault',
 'https://stablevault-demo.vercel.app'),

-- GameFi Revolution Hackathon projects (upcoming but with early submissions - id 27)
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 7, 
 'MetaQuest RPG',
 'Play-to-earn RPG game with NFT characters and weapons. Features multiplayer battles, quest system, and in-game marketplace.',
 'https://github.com/hackathon/metaquest-rpg',
 'https://metaquest-demo.vercel.app'),

((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 
 8, 
 'CryptoRacers',
 'NFT racing game where players own, upgrade, and race crypto-themed vehicles. Tournaments with real crypto prizes.',
 'https://github.com/hackathon/cryptoracers',
 'https://cryptoracers-demo.vercel.app');

-- Add project members for each project
-- SmartPredict AI team (Hacker1 as lead)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'SmartPredict AI'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker1'),
 'Team Lead'),
 
((SELECT id FROM projects WHERE name = 'SmartPredict AI'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker2'),
 'Developer');

-- Neural DAO team (Hacker3 solo)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'Neural DAO'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker3'),
 'Solo Developer');

-- ChainGuard AI team (Hacker1 and Hacker3)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'ChainGuard AI'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker1'),
 'Team Lead'),
 
((SELECT id FROM projects WHERE name = 'ChainGuard AI'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker3'),
 'AI Specialist');

-- YieldOptimizer Pro team (Hacker2 as lead)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'YieldOptimizer Pro'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker2'),
 'Team Lead'),
 
((SELECT id FROM projects WHERE name = 'YieldOptimizer Pro'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker1'),
 'Smart Contract Developer');

-- FlashSwap DEX team (Hacker3 and Hacker2)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'FlashSwap DEX'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker3'),
 'Lead Developer'),
 
((SELECT id FROM projects WHERE name = 'FlashSwap DEX'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker2'),
 'Frontend Developer');

-- StableVault team (All three hackers)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'StableVault'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker1'),
 'Team Lead'),
 
((SELECT id FROM projects WHERE name = 'StableVault'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker2'),
 'Protocol Designer'),
 
((SELECT id FROM projects WHERE name = 'StableVault'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker3'),
 'Security Auditor');

-- MetaQuest RPG team (Hacker1 and Hacker2)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'MetaQuest RPG'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker1'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker1'),
 'Game Developer'),
 
((SELECT id FROM projects WHERE name = 'MetaQuest RPG'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker2'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker2'),
 'NFT Artist');

-- CryptoRacers team (Hacker3 solo)
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
((SELECT id FROM projects WHERE name = 'CryptoRacers'), 
 (SELECT id FROM users WHERE full_name = 'Tejsvi Hacker3'),
 (SELECT wallet_address FROM users WHERE full_name = 'Tejsvi Hacker3'),
 'Full Stack Developer');

-- Verify projects were added
SELECT h.name as hackathon, h.status, COUNT(p.id) as project_count, 
       STRING_AGG(p.name, ', ') as projects
FROM hackathons h
LEFT JOIN projects p ON h.id = p.hackathon_id
WHERE h.status IN ('ongoing', 'completed') OR h.name = 'GameFi Revolution Hackathon'
GROUP BY h.id, h.name, h.status
ORDER BY h.name;
