-- Query untuk cek data security logs terbaru
-- Gunakan ini untuk debugging apakah nama security tersimpan

SELECT 
    id,
    request_id,
    km_awal,
    km_akhir,
    security_berangkat,
    security_kembali,
    jam_berangkat,
    jam_kembali,
    logged_by
FROM transport_security_logs
ORDER BY id DESC
LIMIT 10;

-- Jika security_berangkat dan security_kembali NULL, berarti:
-- 1. Database belum punya kolom tersebut (perlu run migration)
-- 2. Atau API tidak menyimpan data (perlu cek code)

-- Cek apakah kolom ada di database:
DESCRIBE transport_security_logs;
