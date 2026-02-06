-- Script untuk hapus semua data permohonan (TransportRequest)
-- User dan Mobil TIDAK dihapus

-- 1. Hapus semua security logs terlebih dahulu (foreign key)
DELETE FROM SecurityLog;

-- 2. Hapus semua fleet assignments
DELETE FROM TransportFleet;

-- 3. Hapus semua approvals
DELETE FROM TransportApproval;

-- 4. Hapus semua transport requests
DELETE FROM TransportRequest;

-- 5. Reset auto-increment ID ke 1 (opsional, untuk mulai dari ID 1 lagi)
-- ALTER TABLE TransportRequest AUTO_INCREMENT = 1;

-- Verifikasi: Cek jumlah data yang tersisa
SELECT 'TransportRequest' as tabel, COUNT(*) as jumlah FROM TransportRequest
UNION ALL
SELECT 'TransportApproval', COUNT(*) FROM TransportApproval
UNION ALL
SELECT 'TransportFleet', COUNT(*) FROM TransportFleet
UNION ALL
SELECT 'SecurityLog', COUNT(*) FROM SecurityLog
UNION ALL
SELECT 'User', COUNT(*) FROM User
UNION ALL
SELECT 'Mobil', COUNT(*) FROM Mobil;
