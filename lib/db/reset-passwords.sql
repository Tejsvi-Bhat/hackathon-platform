-- Reset all user passwords to 'password123'
-- Bcrypt hash for 'password123' with salt rounds 10
-- Generated using: bcrypt.hash('password123', 10)

UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'organizer@test.com';
UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'judge1@test.com';
UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'judge2@test.com';
UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'participant1@test.com';
UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'participant2@test.com';
UPDATE users SET password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' WHERE email = 'participant3@test.com';

-- Verify passwords were updated
SELECT email, full_name, role, 
       CASE WHEN password_hash = '$2b$10$rKZgJQXO7Y.IqK8V4h7dVOX5rP7xVZ8yLQO5tHzJ8yO9K8wYzX.Xy' THEN 'Updated' ELSE 'Different' END as password_status
FROM users
ORDER BY id;
