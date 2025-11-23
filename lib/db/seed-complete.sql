-- Complete seed data for Hackathon Platform
-- Run this script on a fresh database after running schema.sql

-- This script includes:
-- 1. Test users (organizers, judges, participants)
-- 2. Hackathons (7 hackathons with varying status)
-- 3. Prizes (with categories and criteria)
-- 4. Schedules (with events and timelines)
-- 5. Judges assignments
-- 6. Registrations (for first 3 hackathons)
-- 7. Projects (submitted by participants)
-- 8. FAQs (for all hackathons)

-- ===== USERS =====
INSERT INTO users (email, password_hash, full_name, role, wallet_address, bio, github_url, linkedin_url) VALUES
('organizer@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash1', 'Tejsvi Organizer', 'organizer', '0xOrganizer1', 'Blockchain event organizer and Web3 enthusiast', 'https://github.com/tejsvi', 'https://linkedin.com/in/tejsvi'),
('judge1@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash2', 'Tejsvi Judge1', 'judge', '0xJudge1', 'Senior blockchain developer with 10+ years experience', 'https://github.com/tejsvi-judge1', 'https://linkedin.com/in/tejsvi-judge1'),
('judge2@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash3', 'Tejsvi Judge2', 'judge', '0xJudge2', 'Smart contract auditor and security expert', 'https://github.com/tejsvi-judge2', 'https://linkedin.com/in/tejsvi-judge2'),
('participant1@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash4', 'Tejsvi Hacker1', 'hacker', '0xParticipant1', 'Full-stack Web3 developer', 'https://github.com/tejsvi-hacker1', 'https://linkedin.com/in/tejsvi-hacker1'),
('participant2@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash5', 'Tejsvi Hacker2', 'hacker', '0xParticipant2', 'Solidity developer and DeFi enthusiast', 'https://github.com/tejsvi-hacker2', 'https://linkedin.com/in/tejsvi-hacker2'),
('participant3@test.com', '$2b$10$rOvWvQ5xH.xZxZxGxQxQxexamplehash6', 'Tejsvi Hacker3', 'hacker', '0xParticipant3', 'React developer transitioning to Web3', 'https://github.com/tejsvi-hacker3', 'https://linkedin.com/in/tejsvi-hacker3');

-- Note: Default password for all test accounts is "password123" (you should hash this properly in production)

-- ===== HACKATHONS =====
INSERT INTO hackathons (name, description, start_date, end_date, organizer_id, organizer_address, status, ecosystem, tech_stack, level, mode, max_team_size, registration_deadline, is_featured, banner_image) VALUES
('Web3 Innovation Summit 2025', 'Join us for the biggest Web3 hackathon of the year! Build innovative dApps, DeFi protocols, NFT projects, and more. Connect with industry leaders and win amazing prizes.', '2025-11-01', '2025-11-15', 1, '0xOrganizer1', 'ongoing', 'Ethereum', ARRAY['Solidity', 'React', 'Hardhat', 'IPFS'], 'intermediate', 'hybrid', 5, '2025-10-25', true, 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200'),
('AI & Blockchain Hackathon', 'Combine the power of AI and blockchain to create next-generation applications. Focus on machine learning, data analytics, and decentralized AI models.', '2025-10-15', '2025-10-30', 1, '0xOrganizer1', 'ongoing', 'Polygon', ARRAY['Python', 'TensorFlow', 'Solidity', 'Web3.js'], 'advanced', 'online', 4, '2025-10-10', false, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200'),
('DeFi Development Challenge', 'Build the next generation of decentralized finance applications. Create lending protocols, DEXs, yield farming platforms, and innovative financial products.', '2025-09-20', '2025-10-05', 1, '0xOrganizer1', 'completed', 'Ethereum', ARRAY['Solidity', 'React', 'Ethers.js', 'Uniswap'], 'advanced', 'online', 4, '2025-09-15', false, 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200'),
('GameFi Revolution Hackathon', 'Build the next generation of blockchain gaming experiences with play-to-earn mechanics, NFT integration, and immersive gameplay. Create games that combine entertainment with economic incentives.', '2025-12-15', '2025-12-22', 1, '0xOrganizer1', 'upcoming', 'Polygon', ARRAY['Unity', 'Solidity', 'IPFS', 'TheGraph'], 'intermediate', 'hybrid', 5, '2025-12-10', true, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200'),
('Climate Tech Web3 Challenge', 'Create innovative blockchain solutions for climate change, carbon credits, renewable energy tracking, and environmental impact. Build transparent systems for sustainability.', '2025-12-20', '2026-01-05', 1, '0xOrganizer1', 'upcoming', 'Ethereum', ARRAY['Solidity', 'React', 'Hardhat', 'Chainlink'], 'advanced', 'online', 4, '2025-12-15', false, 'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=1200'),
('NFT Marketplace Builder Sprint', 'Design and develop a complete NFT marketplace with unique features, royalty systems, and community governance. Focus on user experience and creator tools.', '2026-01-10', '2026-01-17', 1, '0xOrganizer1', 'upcoming', 'Solana', ARRAY['Rust', 'React', 'Metaplex', 'Anchor'], 'beginner', 'online', 3, '2026-01-05', false, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200'),
('DeFi Security Audit Hackathon', 'Find vulnerabilities and build security tools for DeFi protocols. Focus on smart contract auditing, exploit prevention, and building secure financial infrastructure.', '2026-01-20', '2026-01-27', 1, '0xOrganizer1', 'upcoming', 'Multi-chain', ARRAY['Solidity', 'Python', 'Slither', 'Foundry'], 'advanced', 'online', 2, '2026-01-15', true, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200');

-- Note: Adjust dates as needed for your deployment timeline

-- ===== PRIZES =====
-- Web3 Innovation Summit
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(1, 'Grand Prize', 50000, 'Best overall project demonstrating innovation and technical excellence', ARRAY['Innovation', 'Technical Implementation', 'User Experience', 'Business Viability']),
(1, 'Best DeFi Project', 25000, 'Most innovative DeFi protocol or application', ARRAY['Smart Contract Quality', 'Security', 'User Experience']),
(1, 'Best NFT Project', 15000, 'Most creative NFT implementation', ARRAY['Creativity', 'Technical Implementation', 'Market Potential']),
(1, 'Best Web3 Social', 10000, 'Best decentralized social platform or feature', ARRAY['User Experience', 'Scalability', 'Community Engagement']);

-- AI & Blockchain
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(2, 'Grand Prize', 40000, 'Best integration of AI and blockchain technologies', ARRAY['Innovation', 'Technical Excellence', 'Practical Application']),
(2, 'Best ML Model', 20000, 'Most innovative machine learning implementation', ARRAY['Model Accuracy', 'Training Efficiency', 'Practical Use Case']),
(2, 'Best Data Analytics', 15000, 'Best blockchain data analytics tool', ARRAY['Insights Quality', 'Visualization', 'Performance']),
(2, 'Best AI DAO', 10000, 'Most innovative AI-powered DAO', ARRAY['Governance Design', 'AI Integration', 'Community Value']);

-- DeFi Development Challenge
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(3, 'Grand Prize', 60000, 'Best DeFi protocol with real-world utility', ARRAY['Innovation', 'Security', 'Market Fit', 'Technical Excellence']),
(3, 'Best DEX', 30000, 'Most innovative decentralized exchange', ARRAY['Trading Experience', 'Liquidity Design', 'Smart Contract Quality']),
(3, 'Best Lending Protocol', 20000, 'Best lending/borrowing platform', ARRAY['Interest Rate Model', 'Risk Management', 'User Experience']);

-- GameFi Revolution
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(4, 'Grand Prize', 45000, 'Best blockchain game with P2E mechanics', ARRAY['Gameplay', 'Tokenomics', 'User Engagement', 'Technical Quality']),
(4, 'Best Game Design', 20000, 'Most engaging and fun gameplay', ARRAY['Game Mechanics', 'Visual Design', 'Player Experience']),
(4, 'Best NFT Integration', 15000, 'Most innovative use of NFTs in gaming', ARRAY['NFT Utility', 'Trading Mechanics', 'Player Ownership']),
(4, 'Best Mobile Game', 10000, 'Best mobile GameFi experience', ARRAY['Mobile UX', 'Performance', 'Accessibility']);

-- Climate Tech Web3
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(5, 'Grand Prize', 50000, 'Best climate impact solution using blockchain', ARRAY['Environmental Impact', 'Technical Innovation', 'Scalability', 'Real-world Applicability']),
(5, 'Best Carbon Credit System', 25000, 'Most effective carbon credit tracking solution', ARRAY['Accuracy', 'Transparency', 'Market Integration']),
(5, 'Best Energy Tracking', 15000, 'Best renewable energy tracking platform', ARRAY['Data Accuracy', 'User Experience', 'Integration Potential']),
(5, 'Best Impact DAO', 10000, 'Most impactful climate-focused DAO', ARRAY['Community Engagement', 'Impact Measurement', 'Governance Model']);

-- NFT Marketplace Builder
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(6, 'Grand Prize', 35000, 'Best complete NFT marketplace', ARRAY['User Experience', 'Feature Completeness', 'Technical Quality']),
(6, 'Best Creator Tools', 18000, 'Best tools for NFT creators', ARRAY['Tool Usability', 'Feature Innovation', 'Creator Value']),
(6, 'Best UI/UX', 12000, 'Most beautiful and intuitive interface', ARRAY['Visual Design', 'User Experience', 'Accessibility']);

-- DeFi Security Audit
INSERT INTO prizes (hackathon_id, category, amount, description, evaluation_criteria) VALUES
(7, 'Grand Prize', 55000, 'Best security tool or audit framework', ARRAY['Vulnerability Detection', 'Tool Usability', 'Impact Potential']),
(7, 'Most Critical Bug Found', 30000, 'Most critical vulnerability discovered', ARRAY['Severity', 'Impact', 'Proof of Concept']),
(7, 'Best Security Dashboard', 20000, 'Best security monitoring dashboard', ARRAY['Visualization', 'Real-time Detection', 'Alert System']),
(7, 'Best Educational Content', 10000, 'Best security education materials', ARRAY['Content Quality', 'Educational Value', 'Accessibility']);

-- Update total prize pools to match sum of prizes
UPDATE hackathons SET total_prize_pool = 100000 WHERE id = 1; -- 50k+25k+15k+10k
UPDATE hackathons SET total_prize_pool = 85000 WHERE id = 2; -- 40k+20k+15k+10k
UPDATE hackathons SET total_prize_pool = 110000 WHERE id = 3; -- 60k+30k+20k
UPDATE hackathons SET total_prize_pool = 90000 WHERE id = 4; -- 45k+20k+15k+10k
UPDATE hackathons SET total_prize_pool = 100000 WHERE id = 5; -- 50k+25k+15k+10k
UPDATE hackathons SET total_prize_pool = 65000 WHERE id = 6; -- 35k+18k+12k
UPDATE hackathons SET total_prize_pool = 115000 WHERE id = 7; -- 55k+30k+20k+10k

-- ===== SCHEDULES =====
-- Web3 Innovation Summit
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(1, 'Opening Ceremony', 'Kickoff event with keynote speakers and networking', '2025-11-01 09:00:00', '2025-11-01 11:00:00', 'Main Hall / Virtual Stream', 'ceremony'),
(1, 'Team Formation & Ideation', 'Form teams and brainstorm project ideas', '2025-11-01 11:00:00', '2025-11-01 14:00:00', 'Breakout Rooms', 'workshop'),
(1, 'Hacking Begins', 'Start building your projects!', '2025-11-01 14:00:00', '2025-11-14 23:59:00', 'Online & In-Person', 'hacking'),
(1, 'Final Presentations', 'Present your projects to judges', '2025-11-15 10:00:00', '2025-11-15 18:00:00', 'Main Hall / Virtual Stream', 'ceremony');

-- AI & Blockchain
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(2, 'Opening Ceremony', 'Introduction to AI & Blockchain integration', '2025-10-15 10:00:00', '2025-10-15 11:30:00', 'Virtual', 'ceremony'),
(2, 'AI Workshop', 'Machine learning basics and blockchain integration', '2025-10-15 12:00:00', '2025-10-15 15:00:00', 'Virtual', 'workshop'),
(2, 'Development Phase', 'Build your AI-powered dApp', '2025-10-15 15:00:00', '2025-10-29 23:59:00', 'Virtual', 'hacking'),
(2, 'Demo Day', 'Show off your AI blockchain solutions', '2025-10-30 09:00:00', '2025-10-30 17:00:00', 'Virtual', 'ceremony');

-- DeFi Development Challenge
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(3, 'Kickoff Event', 'DeFi landscape overview and challenge introduction', '2025-09-20 09:00:00', '2025-09-20 10:30:00', 'Virtual', 'ceremony'),
(3, 'Smart Contract Security Workshop', 'Learn about DeFi security best practices', '2025-09-20 11:00:00', '2025-09-20 14:00:00', 'Virtual', 'workshop'),
(3, 'Development Period', 'Build your DeFi protocol', '2025-09-20 14:00:00', '2025-10-04 23:59:00', 'Virtual', 'hacking'),
(3, 'Final Judging', 'Present your DeFi innovations', '2025-10-05 09:00:00', '2025-10-05 16:00:00', 'Virtual', 'ceremony');

-- GameFi Revolution
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(4, 'Opening Ceremony', 'Welcome to GameFi Revolution', '2025-12-15 10:00:00', '2025-12-15 11:30:00', 'Gaming Convention Center / Online', 'ceremony'),
(4, 'Game Design Workshop', 'Learn about P2E mechanics and tokenomics', '2025-12-15 12:00:00', '2025-12-15 15:00:00', 'Workshop Room', 'workshop'),
(4, 'Development Sprint', 'Create your blockchain game', '2025-12-15 15:00:00', '2025-12-21 23:59:00', 'Online & In-Person', 'hacking'),
(4, 'Gameplay Showcase', 'Live demos and final presentations', '2025-12-22 10:00:00', '2025-12-22 18:00:00', 'Main Stage / Virtual', 'ceremony');

-- Climate Tech Web3
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(5, 'Launch Event', 'Climate crisis meets blockchain technology', '2025-12-20 09:00:00', '2025-12-20 11:00:00', 'Virtual', 'ceremony'),
(5, 'Carbon Credits Workshop', 'Understanding carbon markets and blockchain', '2025-12-20 11:30:00', '2025-12-20 14:00:00', 'Virtual', 'workshop'),
(5, 'Building Phase', 'Develop your climate solution', '2025-12-20 14:00:00', '2026-01-04 23:59:00', 'Virtual', 'hacking'),
(5, 'Impact Presentations', 'Showcase your environmental solutions', '2026-01-05 09:00:00', '2026-01-05 17:00:00', 'Virtual', 'ceremony');

-- NFT Marketplace Builder
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(6, 'Kickoff', 'NFT marketplace trends and requirements', '2026-01-10 10:00:00', '2026-01-10 11:00:00', 'Virtual', 'ceremony'),
(6, 'UI/UX Workshop', 'Designing great NFT experiences', '2026-01-10 11:30:00', '2026-01-10 14:00:00', 'Virtual', 'workshop'),
(6, 'Development Week', 'Build your NFT marketplace', '2026-01-10 14:00:00', '2026-01-16 23:59:00', 'Virtual', 'hacking'),
(6, 'Demo Day', 'Present your marketplace', '2026-01-17 09:00:00', '2026-01-17 15:00:00', 'Virtual', 'ceremony');

-- DeFi Security Audit
INSERT INTO schedules (hackathon_id, title, description, start_time, end_time, location, event_type) VALUES
(7, 'Security Summit Opening', 'State of DeFi security in 2026', '2026-01-20 09:00:00', '2026-01-20 10:30:00', 'Virtual', 'ceremony'),
(7, 'Audit Techniques Workshop', 'Learn professional auditing methods', '2026-01-20 11:00:00', '2026-01-20 15:00:00', 'Virtual', 'workshop'),
(7, 'Audit Sprint', 'Find vulnerabilities and build tools', '2026-01-20 15:00:00', '2026-01-26 23:59:00', 'Virtual', 'hacking'),
(7, 'Security Showcase', 'Present findings and tools', '2026-01-27 09:00:00', '2026-01-27 16:00:00', 'Virtual', 'ceremony');

-- ===== JUDGES =====
-- Assign judges to hackathons
INSERT INTO judges (hackathon_id, user_id, expertise) VALUES
(1, 2, ARRAY['Smart Contracts', 'DeFi', 'NFTs']),
(1, 3, ARRAY['Security', 'Smart Contract Auditing']),
(2, 2, ARRAY['AI/ML', 'Blockchain Integration']),
(3, 2, ARRAY['DeFi Protocols', 'Smart Contracts']),
(3, 3, ARRAY['Security', 'Financial Systems']);

-- ===== REGISTRATIONS (Only for first 3 hackathons) =====
INSERT INTO registrations (hackathon_id, user_id, team_name, team_size, registration_date) VALUES
(1, 4, 'Web3 Warriors', 3, '2025-10-20 14:30:00'),
(1, 5, 'Blockchain Builders', 4, '2025-10-21 10:15:00'),
(2, 4, 'AI Innovators', 2, '2025-10-08 09:00:00'),
(3, 5, 'DeFi Pioneers', 3, '2025-09-14 16:45:00'),
(3, 6, 'Smart Contract Squad', 2, '2025-09-15 11:20:00');

-- ===== PROJECTS (Submitted by participants) =====
-- Projects for Web3 Innovation Summit
INSERT INTO projects (hackathon_id, user_id, title, description, github_url, demo_url, tech_stack, submission_date, likes_count, project_image) VALUES
(1, 4, 'DecentralBank', 'A fully decentralized banking platform built on Ethereum with yield farming and lending capabilities. Features include automated market making, governance tokens, and cross-chain bridging.', 'https://github.com/example/decentralbank', 'https://demo.decentralbank.io', ARRAY['Solidity', 'React', 'Hardhat', 'IPFS', 'The Graph'], '2025-11-14 20:00:00', 45, 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'),
(1, 5, 'NFT Launchpad', 'Complete NFT minting and marketplace platform with royalty distribution and community governance features.', 'https://github.com/example/nft-launchpad', 'https://nftlaunchpad.demo.io', ARRAY['Solidity', 'Next.js', 'IPFS', 'Pinata'], '2025-11-14 19:30:00', 38, 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800');

-- Projects for AI & Blockchain
INSERT INTO projects (hackathon_id, user_id, title, description, github_url, demo_url, tech_stack, submission_date, likes_count, project_image) VALUES
(2, 4, 'AI Oracle Network', 'Decentralized oracle network powered by machine learning for accurate price predictions and data verification.', 'https://github.com/example/ai-oracle', 'https://ai-oracle-demo.io', ARRAY['Python', 'TensorFlow', 'Solidity', 'Chainlink'], '2025-10-29 22:00:00', 52, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800');

-- Projects for DeFi Challenge
INSERT INTO projects (hackathon_id, user_id, title, description, github_url, demo_url, tech_stack, submission_date, likes_count, project_image) VALUES
(3, 5, 'FlashLend Protocol', 'Advanced lending protocol with flash loan capabilities and dynamic interest rates based on utilization.', 'https://github.com/example/flashlend', 'https://flashlend.demo.io', ARRAY['Solidity', 'React', 'Ethers.js', 'Hardhat'], '2025-10-04 21:00:00', 67, 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800'),
(3, 6, 'Yield Optimizer', 'Automated yield farming optimizer that finds the best APY across multiple DeFi protocols.', 'https://github.com/example/yield-optimizer', 'https://yieldopt.demo.io', ARRAY['Solidity', 'Vue.js', 'Web3.js'], '2025-10-04 20:30:00', 41, 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800');

-- Add project members
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 4, 'Team Lead'),
(2, 5, 'Team Lead'),
(3, 4, 'Team Lead'),
(4, 5, 'Team Lead'),
(5, 6, 'Team Lead');

-- Add project tags
INSERT INTO project_tags (project_id, tag_name) VALUES
(1, 'DeFi'),
(1, 'Lending'),
(1, 'Yield Farming'),
(2, 'NFT'),
(2, 'Marketplace'),
(2, 'Governance'),
(3, 'AI'),
(3, 'Oracle'),
(3, 'Machine Learning'),
(4, 'DeFi'),
(4, 'Lending'),
(4, 'Flash Loans'),
(5, 'DeFi'),
(5, 'Yield Farming'),
(5, 'Automation');

-- ===== FAQs =====
-- Web3 Innovation Summit
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(1, 'What are the eligibility requirements?', 'Open to developers worldwide. Teams can have up to 5 members. All experience levels welcome.', 1),
(1, 'Do I need to have a team before registering?', 'No! You can register as an individual and find teammates during the team formation session on Day 1.', 2),
(1, 'Are there any costs to participate?', 'No, participation is completely free! We provide all necessary resources and API keys.', 3);

-- AI & Blockchain
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(2, 'Do I need AI/ML experience?', 'Basic understanding is helpful, but we will provide workshops and resources to help you get started.', 1),
(2, 'What AI frameworks can I use?', 'You can use any AI/ML framework including TensorFlow, PyTorch, Scikit-learn, and cloud AI services.', 2),
(2, 'Will mentors be available?', 'Yes! We have AI and blockchain experts available throughout the hackathon for guidance.', 3);

-- DeFi Development Challenge
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(3, 'Can I fork existing DeFi protocols?', 'Yes, you can build upon existing protocols, but significant innovation and improvements are expected.', 1),
(3, 'How important is security?', 'Extremely important! Projects will be evaluated on security practices. We encourage security audits.', 2),
(3, 'Do projects need to be deployed to mainnet?', 'No, testnet deployment is sufficient. Please do not deploy unaudited contracts to mainnet.', 3);

-- GameFi Revolution
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(4, 'What game engines are allowed?', 'You can use Unity, Unreal Engine, Godot, or web-based engines like Phaser and Three.js.', 1),
(4, 'Must the game be fully playable?', 'A working prototype or MVP is expected. Focus on core gameplay mechanics and blockchain integration.', 2),
(4, 'Can I use pre-made assets?', 'Yes, you can use pre-made assets, but gameplay mechanics and smart contracts must be original.', 3);

-- Climate Tech Web3
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(5, 'What defines a climate tech solution?', 'Any blockchain project that addresses climate change, carbon reduction, renewable energy, or environmental sustainability.', 1),
(5, 'Do I need climate science expertise?', 'Not required, but understanding the problem you''re solving is important. We provide educational resources.', 2),
(5, 'Can non-profits participate?', 'Absolutely! We encourage participation from environmental organizations and impact-driven teams.', 3);

-- NFT Marketplace Builder
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(6, 'What blockchain should I build on?', 'Solana is the focus, but you can build on any blockchain. However, Solana projects get priority consideration.', 1),
(6, 'Must the marketplace be feature-complete?', 'Core features expected: minting, buying/selling, wallet integration. Advanced features are bonus points.', 2),
(6, 'Can I use existing marketplace templates?', 'You can reference them for learning, but your code must be original. Direct copying will result in disqualification.', 3);

-- DeFi Security Audit
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(7, 'What protocols can we audit?', 'We will provide a list of protocols and smart contracts to audit. You can also suggest protocols.', 1),
(7, 'Do I need auditing experience?', 'Helpful but not required. We provide training workshops and access to auditing tools.', 2),
(7, 'How are vulnerabilities verified?', 'All submitted vulnerabilities must include proof-of-concept code. Our security team will verify findings.', 3);

-- Success! All seed data loaded

