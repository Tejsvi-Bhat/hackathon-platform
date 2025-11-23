-- Add more upcoming hackathons with no registrations

INSERT INTO hackathons (
  name, 
  description, 
  start_date, 
  end_date, 
  organizer_id, 
  organizer_address, 
  status,
  ecosystem,
  tech_stack,
  level,
  mode,
  max_team_size,
  registration_deadline,
  is_featured,
  banner_image
) VALUES 
(
  'GameFi Revolution Hackathon',
  'Build the next generation of blockchain gaming experiences with play-to-earn mechanics, NFT integration, and immersive gameplay. Create games that combine entertainment with economic incentives.',
  '2025-12-15',
  '2025-12-22',
  1,
  '0xOrganizer1',
  'upcoming',
  'Polygon',
  ARRAY['Unity', 'Solidity', 'IPFS', 'TheGraph'],
  'intermediate',
  'hybrid',
  5,
  '2025-12-10',
  true,
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200'
),
(
  'Climate Tech Web3 Challenge',
  'Create innovative blockchain solutions for climate change, carbon credits, renewable energy tracking, and environmental impact. Build transparent systems for sustainability.',
  '2025-12-20',
  '2026-01-05',
  1,
  '0xOrganizer1',
  'upcoming',
  'Ethereum',
  ARRAY['Solidity', 'React', 'Hardhat', 'Chainlink'],
  'advanced',
  'online',
  4,
  '2025-12-15',
  false,
  'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=1200'
),
(
  'NFT Marketplace Builder Sprint',
  'Design and develop a complete NFT marketplace with unique features, royalty systems, and community governance. Focus on user experience and creator tools.',
  '2026-01-10',
  '2026-01-17',
  1,
  '0xOrganizer1',
  'upcoming',
  'Solana',
  ARRAY['Rust', 'React', 'Metaplex', 'Anchor'],
  'beginner',
  'online',
  3,
  '2026-01-05',
  false,
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200'
),
(
  'DeFi Security Audit Hackathon',
  'Find vulnerabilities and build security tools for DeFi protocols. Focus on smart contract auditing, exploit prevention, and building secure financial infrastructure.',
  '2026-01-20',
  '2026-01-27',
  1,
  '0xOrganizer1',
  'upcoming',
  'Multi-chain',
  ARRAY['Solidity', 'Python', 'Slither', 'Foundry'],
  'advanced',
  'online',
  2,
  '2026-01-15',
  true,
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200'
),
(
  'Social Impact DAO Sprint',
  'Build decentralized autonomous organizations focused on social good. Create voting systems, treasury management, and community governance tools.',
  '2026-02-01',
  '2026-02-08',
  1,
  '0xOrganizer1',
  'upcoming',
  'Ethereum',
  ARRAY['Solidity', 'React', 'Aragon', 'Snapshot'],
  'intermediate',
  'online',
  4,
  '2026-01-25',
  false,
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200'
);

-- Add prizes for new hackathons (blockchain_prize_id can be NULL for now)
INSERT INTO prizes (hackathon_id, blockchain_prize_id, title, description, amount, position, category, evaluation_criteria, voting_type) VALUES
-- GameFi Revolution (hackathon_id will be 4)
(4, NULL, 'Best Game Overall', 'Most engaging and innovative blockchain game', 10000, 1, 'Grand Prize', ARRAY['Gameplay Quality', 'Token Economics', 'Innovation', 'User Experience'], 'judge'),
(4, NULL, 'Best NFT Integration', 'Creative use of NFTs in gameplay', 8000, 2, 'Technical Excellence', ARRAY['NFT Utility', 'Smart Contract Design', 'Asset Management'], 'judge'),
(4, NULL, 'Best Mobile Game', 'Outstanding mobile gaming experience', 5000, 3, 'Platform Prize', ARRAY['Performance', 'UI/UX', 'Accessibility'], 'community'),
(4, NULL, 'Community Choice', 'Fan favorite game', 2000, 4, 'Community Prize', ARRAY['Entertainment Value', 'Community Engagement'], 'community'),

-- Climate Tech (hackathon_id will be 5)
(5, NULL, 'Grand Prize', 'Most impactful climate solution', 15000, 1, 'Grand Prize', ARRAY['Environmental Impact', 'Scalability', 'Innovation'], 'judge'),
(5, NULL, 'Best Carbon Credit System', 'Innovative carbon tracking solution', 8000, 2, 'Technical Excellence', ARRAY['Accuracy', 'Transparency', 'Verification'], 'judge'),
(5, NULL, 'Best Renewable Energy Tracker', 'Outstanding energy tracking solution', 5000, 3, 'Technical Excellence', ARRAY['Data Integrity', 'Real-time Monitoring'], 'judge'),
(5, NULL, 'Sustainability Award', 'Long-term environmental impact', 2000, 4, 'Special Prize', ARRAY['Long-term Vision', 'Sustainability'], 'judge'),

-- NFT Marketplace (hackathon_id will be 6)
(6, NULL, 'Best Overall Marketplace', 'Most complete and polished marketplace', 8000, 1, 'Grand Prize', ARRAY['Feature Completeness', 'User Experience', 'Design'], 'judge'),
(6, NULL, 'Best Royalty System', 'Innovative creator royalty mechanism', 4000, 2, 'Technical Excellence', ARRAY['Fairness', 'Automation', 'Transparency'], 'judge'),
(6, NULL, 'Best UI/UX', 'Most user-friendly interface', 3000, 3, 'Design Prize', ARRAY['Visual Design', 'Usability', 'Accessibility'], 'community'),

-- DeFi Security (hackathon_id will be 7)
(7, NULL, 'Critical Vulnerability Prize', 'Most critical security finding', 20000, 1, 'Grand Prize', ARRAY['Severity', 'Impact', 'Proof of Concept'], 'judge'),
(7, NULL, 'Best Security Tool', 'Most useful security auditing tool', 12000, 2, 'Technical Excellence', ARRAY['Effectiveness', 'Automation', 'Usability'], 'judge'),
(7, NULL, 'Best Audit Report', 'Comprehensive security analysis', 6000, 3, 'Documentation Prize', ARRAY['Thoroughness', 'Clarity', 'Recommendations'], 'judge'),
(7, NULL, 'Innovation Award', 'Novel security approach', 2000, 4, 'Special Prize', ARRAY['Innovation', 'Practicality'], 'judge'),

-- Social Impact DAO (hackathon_id will be 8)
(8, NULL, 'Best DAO Overall', 'Most impactful social DAO', 12000, 1, 'Grand Prize', ARRAY['Social Impact', 'Governance Model', 'Sustainability'], 'judge'),
(8, NULL, 'Best Voting System', 'Innovative voting mechanism', 6000, 2, 'Technical Excellence', ARRAY['Fairness', 'Security', 'Participation'], 'judge'),
(8, NULL, 'Community Impact Award', 'Greatest community benefit', 4000, 3, 'Community Prize', ARRAY['Real-world Impact', 'Inclusivity'], 'community');

-- Update total_prize_pool for new hackathons
UPDATE hackathons SET total_prize_pool = (
  SELECT SUM(amount) FROM prizes WHERE hackathon_id = hackathons.id
) WHERE id IN (4, 5, 6, 7, 8);

-- Add schedules for new hackathons (blockchain_schedule_id can be NULL for now)
INSERT INTO schedules (hackathon_id, blockchain_schedule_id, event_name, description, event_time, location) VALUES
-- GameFi Revolution
(4, NULL, 'Opening Ceremony', 'Kickoff event with gaming industry experts', '2025-12-15 10:00:00', 'Virtual Main Stage'),
(4, NULL, 'Unity Workshop', 'Building games with Unity and blockchain', '2025-12-16 14:00:00', 'Workshop Room A'),
(4, NULL, 'Midpoint Check-in', 'Team progress review and feedback', '2025-12-18 15:00:00', 'Virtual'),
(4, NULL, 'Final Presentations', 'Team demos and judging', '2025-12-22 10:00:00', 'Main Hall'),

-- Climate Tech
(5, NULL, 'Kickoff & Networking', 'Meet teams and climate tech experts', '2025-12-20 09:00:00', 'Virtual Conference'),
(5, NULL, 'Carbon Credit Workshop', 'Understanding carbon markets', '2025-12-22 14:00:00', 'Online'),
(5, NULL, 'Mentor Sessions', 'One-on-one with climate experts', '2025-12-27 10:00:00', 'Virtual'),
(5, NULL, 'Demo Day', 'Present solutions to judges', '2026-01-05 10:00:00', 'Virtual Main Stage'),

-- NFT Marketplace
(6, NULL, 'Opening & Orientation', 'Getting started with NFT development', '2026-01-10 10:00:00', 'Online'),
(6, NULL, 'Solana Workshop', 'Building on Solana blockchain', '2026-01-12 14:00:00', 'Virtual Workshop'),
(6, NULL, 'Design Review', 'UI/UX feedback session', '2026-01-14 15:00:00', 'Online'),
(6, NULL, 'Final Showcase', 'Marketplace demonstrations', '2026-01-17 10:00:00', 'Virtual Main Stage'),

-- DeFi Security
(7, NULL, 'Security Briefing', 'Current DeFi vulnerabilities overview', '2026-01-20 10:00:00', 'Online'),
(7, NULL, 'Tool Building Workshop', 'Creating security tools', '2026-01-22 14:00:00', 'Virtual Workshop'),
(7, NULL, 'Audit Submissions', 'Submit security findings', '2026-01-26 18:00:00', 'Online'),
(7, NULL, 'Results & Awards', 'Winners announcement', '2026-01-27 15:00:00', 'Virtual Main Stage'),

-- Social Impact DAO
(8, NULL, 'DAO Fundamentals', 'Introduction to DAO governance', '2026-02-01 10:00:00', 'Virtual'),
(8, NULL, 'Governance Workshop', 'Designing voting systems', '2026-02-03 14:00:00', 'Online'),
(8, NULL, 'Progress Check', 'Team updates and feedback', '2026-02-05 15:00:00', 'Virtual'),
(8, NULL, 'Demo & Judging', 'Final presentations', '2026-02-08 10:00:00', 'Virtual Main Stage');

-- Add FAQs for new hackathons
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
-- GameFi Revolution
(4, 'What gaming engines are allowed?', 'You can use any game engine including Unity, Unreal Engine, Godot, or custom engines. We recommend Unity for best blockchain integration support.', 1),
(4, 'Do we need to deploy a fully playable game?', 'A working prototype with core gameplay mechanics is sufficient. Focus on demonstrating your unique blockchain integration.', 2),
(4, 'Can we use existing game assets?', 'Yes, you can use free or licensed assets from asset stores. Just ensure you have proper licensing and credit appropriately.', 3),

-- Climate Tech
(5, 'Do we need real carbon credit data?', 'You can use simulated or historical data. If you have access to real data sources, that would be a plus but is not required.', 1),
(5, 'What blockchains are supported?', 'Ethereum mainnet and testnets are preferred, but solutions on other EVM-compatible chains are also welcome.', 2),
(5, 'Can non-technical team members participate?', 'Absolutely! We value diverse perspectives including environmental scientists, policy experts, and designers.', 3),

-- NFT Marketplace
(6, 'Is Solana experience required?', 'No prior Solana experience is needed. We will provide workshops and documentation to help you get started.', 1),
(6, 'What makes a good NFT marketplace?', 'Focus on unique features like innovative royalty systems, community governance, creator tools, or specialized niches.', 2),
(6, 'Can we fork existing marketplace code?', 'You can reference open-source projects, but your submission should have significant original features and improvements.', 3),

-- DeFi Security
(7, 'What protocols can we audit?', 'You can audit any DeFi protocol, including lending platforms, DEXs, yield farms, or derivatives. We will provide a list of suggested protocols.', 1),
(7, 'What tools should we use?', 'Popular tools include Slither, Mythril, Echidna, and Foundry. You can also build your own security tools.', 2),
(7, 'How are findings scored?', 'Based on severity (critical/high/medium/low), impact, quality of proof of concept, and recommendations provided.', 3),

-- Social Impact DAO
(8, 'What social causes are eligible?', 'Any positive social impact including education, healthcare, poverty reduction, community development, or humanitarian aid.', 1),
(8, 'Do we need real DAO members?', 'You can simulate DAO membership for the hackathon, but bonus points for having real community members involved.', 2),
(8, 'What governance mechanisms should we implement?', 'At minimum, implement voting and proposal systems. Advanced features like quadratic voting or delegated voting are encouraged.', 3);
