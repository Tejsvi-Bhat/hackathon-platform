-- Revert participant names back to original
UPDATE users SET full_name = 'Tejsvi Hacker1' WHERE id = 38;
UPDATE users SET full_name = 'Tejsvi Hacker2' WHERE id = 39;
UPDATE users SET full_name = 'Tejsvi Hacker3' WHERE id = 40;

-- Get list of valid user IDs for reference
SELECT id, email, full_name FROM users WHERE id IN (38, 39, 40);

-- Show current project members for participant1
SELECT p.id, p.name, u.id as user_id, u.email, u.full_name, pm.role
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
JOIN users u ON pm.user_id = u.id
WHERE pm.user_id = 38
ORDER BY p.id;
