-- Script untuk reset ID transport_requests mulai dari 1
-- PERINGATAN: Ini akan mengubah semua ID yang ada!

-- Step 1: Hapus semua data (HATI-HATI!)
TRUNCATE TABLE transport_security_logs;
TRUNCATE TABLE transport_fleet;
TRUNCATE TABLE transport_approvals;
TRUNCATE TABLE transport_requests;

-- Step 2: Reset auto increment ke 1
ALTER TABLE transport_requests AUTO_INCREMENT = 1;

-- Sekarang permohonan baru akan mulai dari ID #1
