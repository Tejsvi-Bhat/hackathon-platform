-- Remove duplicate prizes
DELETE FROM prizes
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY hackathon_id, title, position ORDER BY id) as rn
        FROM prizes
        WHERE hackathon_id >= 4
    ) t
    WHERE rn > 1
);

-- Remove duplicate schedules
DELETE FROM schedules
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY hackathon_id, event_name, event_time ORDER BY id) as rn
        FROM schedules
        WHERE hackathon_id >= 4
    ) t
    WHERE rn > 1
);

-- Remove duplicate FAQs
DELETE FROM hackathon_faqs
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY hackathon_id, question ORDER BY id) as rn
        FROM hackathon_faqs
        WHERE hackathon_id >= 4
    ) t
    WHERE rn > 1
);
