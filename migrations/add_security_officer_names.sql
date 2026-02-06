-- Migration: Menambahkan kolom nama security officer pada tabel transport_security_logs
-- Tanggal: 2026-02-06
-- Deskripsi: Menambahkan tracking nama petugas security yang melakukan check-in dan check-out

-- Tambahkan kolom security_berangkat (nama security saat check-in)
ALTER TABLE transport_security_logs 
ADD COLUMN security_berangkat VARCHAR(100) NULL AFTER logged_by;

-- Tambahkan kolom security_kembali (nama security saat check-out)
ALTER TABLE transport_security_logs 
ADD COLUMN security_kembali VARCHAR(100) NULL AFTER security_berangkat;

-- Verifikasi perubahan
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'transport_security_logs'
AND COLUMN_NAME IN ('security_berangkat', 'security_kembali');
