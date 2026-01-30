# E-Transport PLN UP2D RIAU

Sistem Pengelolaan Kendaraan Operasional untuk PLN UP2D Riau.

## Fitur Utama
- **Pengajuan Kendaraan**: Alur pengajuan digital oleh pemohon.
- **Persetujuan (Approval)**: Flow persetujuan berjenjang (Asmen/KKU).
- **Manajemen Armada (Fleet)**: Penugasan unit dan pengemudi secara real-time.
- **Keamanan (Security)**: Log check-in/out dengan Live Camera Capture dan KM tracking.
- **Tanda Tangan Digital**: Validasi dokumen menggunakan QR Code yang unik dan informatif.
- **Dashboard & Monitoring**: Visualisasi penggunaan armada dan status kendaraan.

## Teknologi
- **Backend**: PHP (CodeIgniter 3)
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript (Bootstrap 4 baseline)
- **Library**: QRCode.js, WebRTC (Camera)

## Cara Instalasi
1. Clone repository: `git clone https://github.com/Nabilla19/e-transportpln.git`
2. Import database `database.sql` ke MySQL.
3. Sesuaikan konfigurasi database di `application/config/database.php`.
4. Jalankan pada environment PHP 7.4+.

---
*Created for PLN UP2D RIAU Final Project.*
