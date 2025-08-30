-- Insert a test change request
INSERT INTO change_requests (
    requester_id,
    requested_shift_id,
    reason,
    status,
    submitted_at
) VALUES (
    1,  -- worker_id from healthcare_workers table
    4,  -- shift_id from shifts table
    'Need to swap shifts due to personal emergency. I have a doctor appointment on the scheduled day.',
    'pending',
    CURRENT_TIMESTAMP
);

-- Verify the insertion
SELECT 
    cr.request_id,
    cr.requester_id,
    cr.requested_shift_id,
    cr.reason,
    cr.status,
    cr.submitted_at,
    hw.employee_id,
    s.start_time,
    s.end_time,
    s.department
FROM change_requests cr
JOIN healthcare_workers hw ON cr.requester_id = hw.worker_id
JOIN shifts s ON cr.requested_shift_id = s.shift_id
WHERE cr.request_id = (SELECT MAX(request_id) FROM change_requests); 