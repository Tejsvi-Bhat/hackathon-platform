-- Get all projects where participant1 (user_id 38) is a team member
SELECT 
    p.id,
    p.name,
    h.name as hackathon_name,
    pm.role,
    p.is_public
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN hackathons h ON p.hackathon_id = h.id
WHERE pm.user_id = 38
ORDER BY p.id;
