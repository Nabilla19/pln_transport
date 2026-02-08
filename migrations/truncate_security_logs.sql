-- SQL untuk menghapus semua data security logs
-- Gunakan ini jika ingin reset data security dan mulai fresh dengan kolom baru

-- Hapus semua data di tabel transport_security_logs
TRUNCATE TABLE transport_security_logs;

-- Atau jika TRUNCATE tidak bisa (karena foreign key), gunakan DELETE:
-- DELETE FROM transport_security_logs;

-- Reset auto increment (opsional, jika ingin ID mulai dari 1 lagi)
ALTER TABLE transport_security_logs AUTO_INCREMENT = 1;

-- Verifikasi data sudah kosong
SELECT COUNT(*) as total_records FROM transport_security_logs;
-- Expected: total_records = 0
