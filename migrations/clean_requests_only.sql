-- ============================================================================
-- SCRIPT CLEANUP PERMOHONAN SAJA
-- ============================================================================
-- Script ini HANYA menghapus data permohonan transport (transport_requests)
-- beserta data yang LANGSUNG terkait dengan permohonan tersebut
--
-- Data yang AKAN DIHAPUS:
--   - Semua permohonan transport (transport_requests)
--   - Approval yang terkait dengan permohonan tersebut (transport_approvals)
--   - Fleet assignment yang terkait (transport_fleet)
--   - Security logs yang terkait (transport_security_logs)
--
-- Data yang TIDAK AKAN DIHAPUS:
--   - Users (users)
--   - Vehicles (transport_vehicles)
--   - Notifikasi (notifikasi_aktivitas) - TETAP ADA
--   - Roles (roles)
-- ============================================================================

-- Step 1: Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Hapus security logs yang terkait dengan permohonan
DELETE FROM transport_security_logs;

-- Step 3: Hapus fleet assignments yang terkait dengan permohonan
DELETE FROM transport_fleet;

-- Step 4: Hapus approvals yang terkait dengan permohonan
DELETE FROM transport_approvals;

-- Step 5: Hapus semua transport requests
DELETE FROM transport_requests;

-- Step 6: Reset auto-increment ke 1 untuk permohonan baru mulai dari #1
ALTER TABLE transport_requests AUTO_INCREMENT = 1;
ALTER TABLE transport_approvals AUTO_INCREMENT = 1;
ALTER TABLE transport_fleet AUTO_INCREMENT = 1;
ALTER TABLE transport_security_logs AUTO_INCREMENT = 1;

-- Step 7: Aktifkan kembali foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFIKASI: Cek jumlah data yang tersisa
-- ============================================================================

SELECT '=== TABEL PERMOHONAN (HARUS 0) ===' as info;

SELECT 'transport_requests' as tabel, COUNT(*) as jumlah_data FROM transport_requests
UNION ALL
SELECT 'transport_approvals', COUNT(*) FROM transport_approvals
UNION ALL
SELECT 'transport_fleet', COUNT(*) FROM transport_fleet
UNION ALL
SELECT 'transport_security_logs', COUNT(*) FROM transport_security_logs;

SELECT '' as info;
SELECT '=== TABEL LAIN (TETAP ADA) ===' as info;

SELECT 'users' as tabel, COUNT(*) as jumlah_data FROM users
UNION ALL
SELECT 'transport_vehicles', COUNT(*) FROM transport_vehicles
UNION ALL
SELECT 'notifikasi_aktivitas', COUNT(*) FROM notifikasi_aktivitas;

-- ============================================================================
-- SELESAI!
-- ============================================================================
-- Permohonan baru akan mulai dari ID #1
-- ============================================================================
