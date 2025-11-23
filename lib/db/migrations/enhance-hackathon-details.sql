-- Add more fields to prizes table for categories
ALTER TABLE prizes
ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'General Prize',
ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT,
ADD COLUMN IF NOT EXISTS voting_type VARCHAR(50) DEFAULT 'judges';

-- Add FAQs table
CREATE TABLE IF NOT EXISTS hackathon_faqs (
    id SERIAL PRIMARY KEY,
    hackathon_id INTEGER REFERENCES hackathons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add project images and likes
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update prizes with categories
UPDATE prizes SET
  category = 'Innovation Excellence',
  evaluation_criteria = 'Originality of idea, technical innovation, real-world impact potential',
  voting_type = 'judges'
WHERE position = 1;

UPDATE prizes SET
  category = 'Sustainable Achiever',
  evaluation_criteria = 'Environmental impact, long-term sustainability, social responsibility',
  voting_type = 'judges'
WHERE position = 2;

UPDATE prizes SET
  category = 'Best Design',
  evaluation_criteria = 'User experience, visual design, accessibility, overall polish',
  voting_type = 'judges'
WHERE position = 3;

-- Insert FAQs for hackathon 1
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(1, 'Who can participate?', 'Anyone passionate about blockchain and Web3 technology! Whether you''re a developer, designer, or enthusiast, you''re welcome to join.', 1),
(1, 'What is the team size limit?', 'Teams can have up to 5 members. Solo participation is also allowed.', 2),
(1, 'Do I need prior blockchain experience?', 'While experience helps, it''s not mandatory. We''ll provide resources and mentorship for beginners.', 3),
(1, 'What should I submit?', 'A working prototype or MVP with source code, documentation, demo video, and presentation slides.', 4),
(1, 'Are there any participation fees?', 'No! Participation is completely free.', 5);

-- Insert FAQs for hackathon 2
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(2, 'What technologies can we use?', 'Any AI/ML frameworks (TensorFlow, PyTorch) combined with blockchain platforms (Ethereum, Polygon).', 1),
(2, 'Is there mentorship available?', 'Yes! Industry experts will be available for guidance throughout the hackathon.', 2),
(2, 'How will projects be judged?', 'Based on innovation, technical implementation, AI integration, and blockchain utilization.', 3),
(2, 'Can we use pre-existing code?', 'Yes, but clearly mention what''s new vs. existing. The new work will be evaluated.', 4);

-- Insert FAQs for hackathon 3
INSERT INTO hackathon_faqs (hackathon_id, question, answer, display_order) VALUES
(3, 'What DeFi protocols are allowed?', 'Any DeFi protocol including lending, DEX, yield farming, derivatives, etc.', 1),
(3, 'Do we need to deploy on mainnet?', 'No, testnet deployment is sufficient for the hackathon.', 2),
(3, 'Are there any security requirements?', 'Yes, basic security best practices must be followed. Smart contracts should be tested.', 3);

-- Update projects with images, likes, and tags
UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
  likes_count = 42,
  tags = ARRAY['DeFi', 'Lending', 'Smart Contracts']
WHERE id = 1;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400',
  likes_count = 38,
  tags = ARRAY['DEX', 'Liquidity', 'Trading']
WHERE id = 2;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400',
  likes_count = 56,
  tags = ARRAY['AI', 'NFT', 'Generative Art']
WHERE id = 3;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  likes_count = 29,
  tags = ARRAY['Social', 'Web3', 'Community']
WHERE id = 4;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=400',
  likes_count = 51,
  tags = ARRAY['NFT', 'Marketplace', 'Trading']
WHERE id = 5;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
  likes_count = 34,
  tags = ARRAY['DAO', 'Governance', 'Voting']
WHERE id = 6;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
  likes_count = 47,
  tags = ARRAY['AI', 'Security', 'Audit']
WHERE id = 7;

UPDATE projects SET
  image_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  likes_count = 40,
  tags = ARRAY['Analytics', 'Data', 'AI']
WHERE id = 8;
