-- Fix status untuk request yang fleet-nya sudah ditolak
-- Update status dari 'Pending Fleet' ke 'Ditolak' untuk request yang punya fleet rejection

UPDATE `transport_requests` tr
SET tr.status = 'Ditolak'
WHERE tr.id IN (
    SELECT DISTINCT tf.request_id 
    FROM `transport_fleet` tf 
    WHERE tf.is_rejected = TRUE
)
AND tr.status = 'Pending Fleet';
