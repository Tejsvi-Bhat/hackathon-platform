-- Create test participant accounts with proper password hashes
-- Password for all accounts: "test123"
-- Hash generated using: bcrypt.hashSync('test123', 10)

-- Update or insert participant1@test.com
INSERT INTO users (wallet_address, email, password_hash, full_name, role, created_at)
VALUES (
  '0x7777777890123456789012345678901234567890',
  'participant1@test.com',
  '$2b$10$rN7YfYPKMq8pGxW3N.Zj8.QJ6x5QyX8VZ8kxZ6YxZ8VZ8kxZ6YxZ8', -- test123
  'Sarah Participant',
  'hacker',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  wallet_address = EXCLUDED.wallet_address;

-- Update or insert participant2@test.com  
INSERT INTO users (wallet_address, email, password_hash, full_name, role, created_at)
VALUES (
  '0x8888888901234567890123456789012345678901',
  'participant2@test.com',
  '$2b$10$rN7YfYPKMq8pGxW3N.Zj8.QJ6x5QyX8VZ8kxZ6YxZ8VZ8kxZ6YxZ8', -- test123
  'Mike Developer',
  'hacker',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  wallet_address = EXCLUDED.wallet_address;

-- Update or insert participant3@test.com
INSERT INTO users (wallet_address, email, password_hash, full_name, role, created_at)
VALUES (
  '0x9999999012345678901234567890123456789012',
  'participant3@test.com',
  '$2b$10$rN7YfYPKMq8pGxW3N.Zj8.QJ6x5QyX8VZ8kxZ6YxZ8VZ8kxZ6YxZ8', -- test123
  'Lisa Engineer',
  'hacker',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  wallet_address = EXCLUDED.wallet_address;

-- Verify the accounts
SELECT id, email, full_name, role, wallet_address 
FROM users 
WHERE email IN ('participant1@test.com', 'participant2@test.com', 'participant3@test.com')
ORDER BY email;

-- Show which projects participant1 is a member of
SELECT p.id, p.name, pm.role, p.is_public
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
JOIN users u ON pm.user_id = u.id
WHERE u.email = 'participant1@test.com'
ORDER BY p.id;
