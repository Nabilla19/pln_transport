# Struktur Folder Proyek E-Transport PLN

Aplikasi ini dibangun menggunakan Framework **CodeIgniter 3** dengan pola arsitektur **MVC (Model-View-Controller)**. Berikut adalah rincian folder dan fungsinya:

## 1. Direktori Utana (Project Root)
- `/application`: Folder inti yang berisi seluruh logika bisnis dan tampilan aplikasi.
- `/system`: Folder core dari CodeIgniter 3 (Jangan diubah).
- `/uploads`: Folder penyimpanan asset dinamis (Foto driver, foto KM).
- `/assets`: Folder asset statis (CSS, JS, Images, Fonts).
- `index.php`: File utama yang memuat framework.

---

## 2. Struktur di dalam `/application`

### A. `/controllers` (Logika Bisnis)
Berfungsi sebagai pengatur alur data antara Model dan View.
- `Transport_request.php`: Menangani tahap pengajuan user.
- `Transport_approval.php`: Menangani tahap persetujuan Asmen.
- `Transport_fleet.php`: Menangani tahap penugasan armada oleh KKU.
- `Transport_security.php`: Menangani operasional di POS Security (Live Camera).

### B. `/models` (Interaksi Database)
Berfungsi mengolah query SQL.
- `Transport_model.php`: Model tunggal yang mengelola 5 tabel utama transport.
- `User_model.php`: Mengelola autentikasi dan hak akses role.

### C. `/views/transport` (Tampilan / UI)
Berisi seluruh template HTML/PHP untuk modul transport.
- `form_request.php`: Form input pengajuan.
- `approval_list.php`: Tabel antrian untuk Asmen.
- `form_fleet.php`: Form penugasan mobil.
- `form_security_in/out.php`: Form check-in/out dengan fitur kamera.
- `detail_request.php`: Halaman tracking perjalanan.
- `export_view.php`: Template untuk cetak surat jalan / PDF.

### D. `/config` (Pengaturan Sistem)
- `database.php`: Konfigurasi koneksi ke MySQL.
- `routes.php`: Pemetaan URL aplikasi.
- `autoload.php`: Memuat library dan helper secara otomatis.

---

## 3. Spesifikasi Folder `/uploads/transport`
Folder ini dibuat secara otomatis jika belum ada. Digunakan untuk menyimpan bukti fisik perjalanan:
- Foto Driver saat Berangkat/Kembali.
- Foto Odometer (KM) sebagai bukti jarak tempuh.
- Mendukung format: `.jpg`, `.jpeg`, `.png`.

---
*Dokumen ini disusun untuk memudahkan pemahaman struktur teknis saat Sidang / Presentasi.*
