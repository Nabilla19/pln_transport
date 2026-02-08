-- ============================================================================
-- SCRIPT CLEANUP DATA DUMMY PERMOHONAN TRANSPORT
-- ============================================================================
-- Script ini akan menghapus SEMUA data permohonan transport beserta data terkait
-- PERINGATAN: Data yang dihapus TIDAK BISA dikembalikan!
-- PASTIKAN sudah backup database sebelum menjalankan script ini!
--
-- Data yang AKAN DIHAPUS:
--   - Semua permohonan transport (transport_requests)
--   - Semua approval permohonan (transport_approvals)
--   - Semua fleet assignments (transport_fleet)
--   - Semua security logs (transport_security_logs)
--   - Semua notifikasi aktivitas (notifikasi_aktivitas)
--
-- Data yang TIDAK AKAN DIHAPUS:
--   - Users (users)
--   - Vehicles (transport_vehicles)
--   - Vehicle types (transport_vehicle_types)
--   - Roles (roles)
-- ============================================================================

-- Step 1: Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Hapus semua notifikasi aktivitas
-- (Notifikasi terkait permohonan, approval, dll)
TRUNCATE TABLE notifikasi_aktivitas;
ALTER TABLE notifikasi_aktivitas AUTO_INCREMENT = 1;

-- Step 3: Hapus semua notifikasi read status
TRUNCATE TABLE notifikasi_read_status;
ALTER TABLE notifikasi_read_status AUTO_INCREMENT = 1;

-- Step 4: Hapus semua security logs
-- (Log foto driver, km awal/akhir, dll)
TRUNCATE TABLE transport_security_logs;
ALTER TABLE transport_security_logs AUTO_INCREMENT = 1;

-- Step 5: Hapus semua fleet assignments
-- (Assignment mobil dan driver ke permohonan)
TRUNCATE TABLE transport_fleet;
ALTER TABLE transport_fleet AUTO_INCREMENT = 1;

-- Step 6: Hapus semua approvals
-- (Approval dari Asmen)
TRUNCATE TABLE transport_approvals;
ALTER TABLE transport_approvals AUTO_INCREMENT = 1;

-- Step 7: Hapus semua transport requests
-- (Data permohonan utama)
TRUNCATE TABLE transport_requests;
ALTER TABLE transport_requests AUTO_INCREMENT = 1;

-- Step 8: Aktifkan kembali foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 9: Reset status kendaraan ke Available (opsional)
-- Uncomment jika ingin reset semua kendaraan ke status Available
-- UPDATE transport_vehicles SET status = 'Available', last_request_id = NULL;

-- ============================================================================
-- VERIFIKASI: Cek jumlah data yang tersisa
-- ============================================================================
-- Semua tabel permohonan harus menunjukkan 0 records
-- Tabel master (users, vehicles) harus masih ada datanya

SELECT '=== TABEL PERMOHONAN (HARUS 0) ===' as info;

SELECT 'transport_requests' as tabel, COUNT(*) as jumlah_data FROM transport_requests
UNION ALL
SELECT 'transport_approvals', COUNT(*) FROM transport_approvals
UNION ALL
SELECT 'transport_fleet', COUNT(*) FROM transport_fleet
UNION ALL
SELECT 'transport_security_logs', COUNT(*) FROM transport_security_logs
UNION ALL
SELECT 'notifikasi_aktivitas', COUNT(*) FROM notifikasi_aktivitas
UNION ALL
SELECT 'notifikasi_read_status', COUNT(*) FROM notifikasi_read_status;

SELECT '' as info;
SELECT '=== TABEL MASTER (HARUS ADA DATA) ===' as info;

SELECT 'users' as tabel, COUNT(*) as jumlah_data FROM users
UNION ALL
SELECT 'transport_vehicles', COUNT(*) FROM transport_vehicles
UNION ALL
SELECT 'transport_vehicle_types', COUNT(*) FROM transport_vehicle_types
UNION ALL
SELECT 'roles', COUNT(*) FROM roles;

-- ============================================================================
-- SELESAI!
-- ============================================================================
-- Jika semua tabel permohonan menunjukkan 0 dan tabel master masih ada datanya,
-- maka cleanup berhasil!
-- 
-- Permohonan baru yang dibuat setelah ini akan mulai dari ID #1
-- ============================================================================
