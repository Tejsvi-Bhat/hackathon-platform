-- Add participant1 as team member to existing projects in production
-- First, ensure projects are public
UPDATE projects SET is_public = TRUE WHERE id IN (SELECT id FROM projects LIMIT 5);

-- Add participant1 (user_id 38) to first 2 projects with proper addresses
DO $$
DECLARE
    project_row RECORD;
    participant1_id INT := 38;
BEGIN
    -- Get first 2 projects
    FOR project_row IN 
        SELECT id FROM projects ORDER BY id LIMIT 2
    LOOP
        -- Add participant1 as team member if not already added
        INSERT INTO project_members (project_id, user_id, member_address, role)
        VALUES (
            project_row.id,
            participant1_id,
            '0x7777777890123456789012345678901234567890',
            'Team Lead'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Added participant1 to project %', project_row.id;
    END LOOP;
END $$;

-- Verify the additions
SELECT p.id, p.name, u.email, u.full_name, pm.role
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
JOIN users u ON pm.user_id = u.id
WHERE u.email = 'participant1@test.com'
ORDER BY p.id;
