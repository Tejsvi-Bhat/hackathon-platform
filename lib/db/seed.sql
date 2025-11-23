-- Seed data for development

-- Insert sample users
INSERT INTO users (wallet_address, email, password_hash, full_name, role, bio) VALUES
('0x1234567890123456789012345678901234567890', 'organizer@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'Alice Organizer', 'organizer', 'Experienced hackathon organizer'),
('0x2234567890123456789012345678901234567890', 'judge1@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'Bob Judge', 'judge', 'Tech industry expert and mentor'),
('0x3234567890123456789012345678901234567890', 'judge2@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'Carol Judge', 'judge', 'Senior software architect'),
('0x4234567890123456789012345678901234567890', 'hacker1@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'David Developer', 'hacker', 'Full-stack developer passionate about Web3'),
('0x5234567890123456789012345678901234567890', 'hacker2@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'Eve Engineer', 'hacker', 'Blockchain enthusiast and smart contract developer'),
('0x6234567890123456789012345678901234567890', 'hacker3@test.com', '$2b$10$XlAV61zoLfCqRrYLwn0Yo.cZ1Bv7ZEBx7CMKvZI2L6Sgb/ZWfR9vi', 'Frank Frontend', 'hacker', 'UI/UX designer and frontend specialist');

-- Insert sample hackathons
INSERT INTO hackathons (blockchain_id, name, description, start_date, end_date, organizer_id, organizer_address, status) VALUES
(1, 'Web3 Innovation Summit 2025', 'Build the next generation of decentralized applications', '2025-12-01 09:00:00', '2025-12-03 18:00:00', 1, '0x1234567890123456789012345678901234567890', 'upcoming'),
(2, 'AI & Blockchain Hackathon', 'Combining AI and blockchain for innovative solutions', '2025-11-15 09:00:00', '2025-11-17 18:00:00', 1, '0x1234567890123456789012345678901234567890', 'ongoing'),
(3, 'DeFi Development Challenge', 'Create decentralized finance applications', '2025-10-01 09:00:00', '2025-10-03 18:00:00', 1, '0x1234567890123456789012345678901234567890', 'completed');

-- Insert prizes
INSERT INTO prizes (hackathon_id, blockchain_prize_id, title, description, amount, position) VALUES
(1, 1, 'First Place', 'Grand prize for the best overall project', 10000.00, 1),
(1, 2, 'Second Place', 'Runner-up prize', 5000.00, 2),
(1, 3, 'Third Place', 'Third place prize', 2500.00, 3),
(2, 4, 'First Place', 'Top AI + Blockchain project', 8000.00, 1),
(2, 5, 'Second Place', 'Runner-up', 4000.00, 2),
(3, 6, 'Winner', 'Best DeFi project', 15000.00, 1);

-- Insert schedules
INSERT INTO schedules (hackathon_id, blockchain_schedule_id, event_name, description, event_time, location) VALUES
(1, 1, 'Opening Ceremony', 'Welcome and introduction to the hackathon', '2025-12-01 09:00:00', 'Main Hall'),
(1, 2, 'Team Formation', 'Find your teammates and form your team', '2025-12-01 10:00:00', 'Networking Area'),
(1, 3, 'Hacking Begins', 'Start building your projects', '2025-12-01 12:00:00', 'All Areas'),
(1, 4, 'Mid-point Check-in', 'Progress review with mentors', '2025-12-02 14:00:00', 'Mentor Rooms'),
(1, 5, 'Final Presentations', 'Present your projects to judges', '2025-12-03 14:00:00', 'Main Stage'),
(1, 6, 'Award Ceremony', 'Winners announcement and prizes', '2025-12-03 17:00:00', 'Main Hall'),
(2, 7, 'Kickoff', 'Hackathon begins', '2025-11-15 09:00:00', 'Virtual'),
(2, 8, 'Submissions Due', 'Final deadline for project submissions', '2025-11-17 18:00:00', 'Virtual');

-- Insert judges for hackathons
INSERT INTO hackathon_judges (hackathon_id, judge_id, judge_address) VALUES
(1, 2, '0x2234567890123456789012345678901234567890'),
(1, 3, '0x3234567890123456789012345678901234567890'),
(2, 2, '0x2234567890123456789012345678901234567890'),
(2, 3, '0x3234567890123456789012345678901234567890'),
(3, 2, '0x2234567890123456789012345678901234567890');

-- Insert sample projects
INSERT INTO projects (blockchain_project_id, hackathon_id, name, description, github_url, demo_url) VALUES
(1, 3, 'DeFi Lending Protocol', 'A decentralized lending and borrowing platform', 'https://github.com/example/defi-lending', 'https://demo.defi-lending.com'),
(2, 3, 'DEX Aggregator', 'Aggregates liquidity from multiple DEXes', 'https://github.com/example/dex-aggregator', 'https://demo.dex-aggregator.com'),
(3, 2, 'AI NFT Generator', 'Generate unique NFTs using AI', 'https://github.com/example/ai-nft', 'https://demo.ai-nft.com');

-- Insert project members
INSERT INTO project_members (project_id, user_id, member_address, role) VALUES
(1, 4, '0x4234567890123456789012345678901234567890', 'team lead'),
(1, 5, '0x5234567890123456789012345678901234567890', 'member'),
(2, 6, '0x6234567890123456789012345678901234567890', 'team lead'),
(3, 4, '0x4234567890123456789012345678901234567890', 'team lead'),
(3, 6, '0x6234567890123456789012345678901234567890', 'member');

-- Insert sample scores
INSERT INTO scores (project_id, judge_id, judge_address, technical_score, innovation_score, presentation_score, impact_score, feedback) VALUES
(1, 2, '0x2234567890123456789012345678901234567890', 85, 90, 88, 92, 'Excellent implementation of DeFi concepts. Great user experience.'),
(1, 3, '0x3234567890123456789012345678901234567890', 88, 87, 85, 90, 'Solid technical architecture. Could improve documentation.'),
(2, 2, '0x2234567890123456789012345678901234567890', 80, 85, 82, 85, 'Good aggregation logic. Nice UI design.');

-- Insert registrations
INSERT INTO registrations (hackathon_id, user_id, status) VALUES
(1, 4, 'confirmed'),
(1, 5, 'confirmed'),
(1, 6, 'confirmed'),
(2, 4, 'confirmed'),
(2, 6, 'confirmed'),
(3, 4, 'confirmed'),
(3, 5, 'confirmed'),
(3, 6, 'confirmed');

-- Insert sample notifications
INSERT INTO notifications (user_id, hackathon_id, title, message, type) VALUES
(4, 1, 'Registration Confirmed', 'Your registration for Web3 Innovation Summit 2025 has been confirmed!', 'registration'),
(4, 2, 'Project Submitted', 'Your project "AI NFT Generator" has been successfully submitted.', 'submission'),
(4, 3, 'Scores Released', 'Scores for DeFi Development Challenge are now available!', 'scores'),
(5, 1, 'Hackathon Starting Soon', 'Web3 Innovation Summit 2025 starts in 2 days!', 'reminder');
