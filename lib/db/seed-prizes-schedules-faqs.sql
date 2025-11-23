-- Seed Prizes for all hackathons
INSERT INTO prizes (hackathon_id, blockchain_prize_id, position, title, amount, description) VALUES
-- Hackathon 1 prizes
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 1, 1, 'First Place', 10000.00, 'Grand prize for the winning team'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 2, 2, 'Second Place', 5000.00, 'Runner-up prize'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 3, 3, 'Third Place', 2500.00, 'Third place prize'),

-- Hackathon 2 prizes
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 4, 1, 'Winner', 7000.00, 'Best AI-Blockchain integration'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 5, 2, 'Runner Up', 3000.00, 'Second best project'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 6, 3, 'Third Place', 2000.00, 'Third place prize'),

-- Hackathon 3 prizes
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 7, 1, 'Grand Prize', 8000.00, 'Best DeFi application'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 8, 2, 'Second Prize', 4500.00, 'Runner-up'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 9, 3, 'Third Prize', 2500.00, 'Third place'),

-- Hackathon 4 prizes
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 10, 1, 'Champion', 15000.00, 'Best GameFi project'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 11, 2, 'Runner Up', 7000.00, 'Second place'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 12, 3, 'Third Place', 3000.00, 'Third place'),

-- Hackathon 5 prizes
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 13, 1, 'Winner', 18000.00, 'Best climate solution'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 14, 2, 'Runner Up', 8000.00, 'Second best'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 15, 3, 'Third Place', 4000.00, 'Third place'),

-- Hackathon 6 prizes
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 16, 1, 'First Place', 9000.00, 'Best NFT marketplace'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 17, 2, 'Second Place', 4000.00, 'Runner-up'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 18, 3, 'Third Place', 2000.00, 'Third place'),

-- Hackathon 7 prizes
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 19, 1, 'Grand Prize', 25000.00, 'Best security tool'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 20, 2, 'Runner Up', 10000.00, 'Second place'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 21, 3, 'Third Place', 5000.00, 'Third place');

-- Seed Schedules for all hackathons
INSERT INTO schedules (hackathon_id, blockchain_schedule_id, event_name, description, event_time, location) VALUES
-- Hackathon 1 schedule
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 1, 'Opening Ceremony', 'Kickoff event and team formation', '2025-12-01 09:00:00', 'Virtual'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 2, 'Hacking Begins', 'Start building your projects', '2025-12-01 10:00:00', 'Virtual'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 3, 'Workshop: Smart Contracts', 'Learn Solidity basics', '2025-12-01 14:00:00', 'Virtual'),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 4, 'Final Presentations', 'Team demos and judging', '2025-12-03 08:00:00', 'Virtual'),

-- Hackathon 2 schedule
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 5, 'Kickoff', 'Introduction and rules', '2025-11-15 09:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 6, 'Building Phase', 'Code your AI solution', '2025-11-15 10:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 7, 'AI Workshop', 'ML model integration', '2025-11-15 15:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 8, 'Judging', 'Project evaluation', '2025-11-17 08:00:00', 'Online'),

-- Hackathon 3 schedule
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 9, 'Opening', 'Welcome and networking', '2025-10-01 09:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 10, 'Development', 'Build DeFi protocols', '2025-10-01 10:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 11, 'Security Workshop', 'DeFi security best practices', '2025-10-02 14:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 12, 'Demo Day', 'Present your protocols', '2025-10-03 08:00:00', 'Online'),

-- Hackathon 4 schedule
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 13, 'Launch Event', 'Game on!', '2025-12-15 09:00:00', 'Hybrid'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 14, 'Game Development', 'Build your game', '2025-12-15 10:00:00', 'Hybrid'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 15, 'NFT Workshop', 'Integrate NFTs in games', '2025-12-16 14:00:00', 'Hybrid'),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 16, 'Gameplay Showcase', 'Demo your games', '2025-12-21 08:00:00', 'Hybrid'),

-- Hackathon 5 schedule
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 17, 'Opening Ceremony', 'Climate action starts now', '2025-12-20 09:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 18, 'Development Phase', 'Build climate solutions', '2025-12-20 10:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 19, 'Carbon Credits Workshop', 'Blockchain for carbon markets', '2025-12-22 14:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 20, 'Final Pitches', 'Present climate solutions', '2026-01-04 08:00:00', 'Online'),

-- Hackathon 6 schedule
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 21, 'Kickoff', 'Start building', '2026-01-10 09:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 22, 'Development', 'Build your marketplace', '2026-01-10 10:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 23, 'IPFS Workshop', 'Decentralized storage', '2026-01-11 14:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 24, 'Demo Day', 'Showcase marketplaces', '2026-01-16 08:00:00', 'Online'),

-- Hackathon 7 schedule
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 25, 'Opening', 'Security first', '2026-01-20 09:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 26, 'Audit Phase', 'Find vulnerabilities', '2026-01-20 10:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 27, 'Security Tools Workshop', 'Audit automation', '2026-01-21 14:00:00', 'Online'),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 28, 'Results', 'Security findings presentation', '2026-01-26 08:00:00', 'Online');

-- Seed FAQs for all hackathons
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
-- Hackathon 1 FAQs
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 'What is the team size limit?', 'Teams can have up to 5 members. Solo participation is also allowed.', 1),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 'Do I need prior blockchain experience?', 'While helpful, prior experience is not mandatory. We will provide workshops and resources.', 2),
((SELECT id FROM hackathons WHERE name = 'Web3 Innovation Summit 2025'), 'What technologies can we use?', 'You can use any Web3 technology stack including Ethereum, Polygon, Solana, etc.', 3),

-- Hackathon 2 FAQs
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 'Can we use pre-trained AI models?', 'Yes, you can use existing AI models and frameworks like TensorFlow, PyTorch, etc.', 1),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 'Is it online or in-person?', 'This is a fully online hackathon. Participate from anywhere!', 2),
((SELECT id FROM hackathons WHERE name = 'AI & Blockchain Hackathon'), 'What are the judging criteria?', 'Innovation, technical implementation, AI-blockchain integration, and practical use case.', 3),

-- Hackathon 3 FAQs
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 'What DeFi protocols can we build?', 'Any DeFi application including DEXs, lending protocols, yield farms, derivatives, etc.', 1),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 'Do we need to deploy on mainnet?', 'No, testnet deployment is sufficient for the hackathon.', 2),
((SELECT id FROM hackathons WHERE name = 'DeFi Development Challenge'), 'Are there any mentors available?', 'Yes, experienced DeFi developers will be available for mentorship.', 3),

-- Hackathon 4 FAQs
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 'What game engines are allowed?', 'Unity, Unreal Engine, or any web-based game framework.', 1),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 'Do we need to create NFTs?', 'NFT integration is encouraged but not mandatory.', 2),
((SELECT id FROM hackathons WHERE name = 'GameFi Revolution Hackathon'), 'Can we submit mobile games?', 'Yes, games for any platform (mobile, web, desktop) are welcome.', 3),

-- Hackathon 5 FAQs
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 'What climate problems should we focus on?', 'Any climate-related issue: carbon credits, renewable energy, emissions tracking, etc.', 1),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 'Is sustainability knowledge required?', 'Basic understanding helps, but we will provide educational resources.', 2),
((SELECT id FROM hackathons WHERE name = 'Climate Tech Web3 Challenge'), 'Are there sustainability experts as judges?', 'Yes, our judging panel includes both blockchain and climate experts.', 3),

-- Hackathon 6 FAQs
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 'What features should the marketplace have?', 'Core features include listing, buying, selling NFTs. Additional features are bonus.', 1),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 'Which blockchain should we use?', 'Any NFT-compatible blockchain - Ethereum, Polygon, Solana, Flow, etc.', 2),
((SELECT id FROM hackathons WHERE name = 'NFT Marketplace Builder Sprint'), 'Can we fork existing marketplaces?', 'You must build from scratch, but can use standard libraries and tools.', 3),

-- Hackathon 7 FAQs
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 'What type of vulnerabilities should we find?', 'Any security issues in smart contracts: reentrancy, overflow, access control, etc.', 1),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 'Can we build audit tools?', 'Yes! Both finding vulnerabilities and building security tools are valid approaches.', 2),
((SELECT id FROM hackathons WHERE name = 'DeFi Security Audit Hackathon'), 'Are there sample contracts to audit?', 'Yes, we will provide vulnerable contracts for testing your skills.', 3);
