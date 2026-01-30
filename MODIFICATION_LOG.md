# Log Modifikasi & Pengembangan Sistem (Enhancements)

Dokumen ini mencatat seluruh pembaruan, perbaikan bug, dan penambahan fitur yang dilakukan pada modul E-Transport.

## 1. Perbaikan Bug (Bug Fixes)
- **Fix Security Log Database Error**: Memperbaiki `Database Error: Unknown column 'security_id'` pada saat check-in security. Masalah disebabkan ketidaksinkronan nama kolom di database yang seharusnya `logged_by`.
- **Fix Fleet Assignment**: Memperbaiki masalah kendaraan tidak muncul pada dropdown penugasan. Penyebabnya adalah ketidaksinkronan nama kolom (`nama_mobil` vs `model`) dan tabel kendaraan yang kosong.
- **Fix Detail View Errors**: Menghilangkan error "Undefined property" pada halaman detail dengan memperbarui `Transport_model` untuk melakukan JOIN ke seluruh tabel terkait (Approvals, Fleet, Security).
- **Safety Checks**: Menambahkan validasi `404 Not Found` jika ID permohonan tidak ditemukan di database untuk mencegah crash sistem.

## 2. Fitur Baru (New Features)
- **Live Camera Capture**: Penambahan fitur ambil foto langsung dari browser untuk:
    - Foto Driver + Mobil.
    - Foto Odometer (KM).
- **Camera Selection**: Mendukung perpindahan kamera (Kamera Depan/Belakang) untuk kemudahan operasional pada perangkat mobile/tablet petugas.
- **User Management Status**: Penambahan field `Status` (Active/Inactive) pada manajemen user untuk memudahkan penonaktifan akses pegawai tanpa menghapus data.
- **Digital Branding Dashboard**: Mengganti data statistik lama dengan data transportasi riil (Total Request, Total Unit, Persentase Ketersediaan Unit).

## 3. Peningkatan Keamanan & Validasi
- **Role-Based Access Control (RBAC)**: Memastikan Admin hanya memiliki hak akses **"View"** pada modul operasional (Security & Fleet) untuk menjaga integritas data riil lapangan.
- **Input Validation**: Menambahkan validasi tipe data dan ukuran file (Max 2MB) pada setiap proses upload foto.
- **Auto-Update Logistics**: Sistem kini otomatis menghitung Jarak Tempuh dan Durasi Perjalanan sesaat setelah KM Akhir diinput oleh Security.

## 4. Dokumentasi Kode
- **Comprehensive Commenting**: Seluruh file Controller dan Model utama telah dilengkapi dengan komentar bahasa Indonesia yang detail untuk memudahkan tim pengembang atau penguji dalam memahami alur sistem.

---
*Log ini bersifat kumulatif dan merupakan bagian dari portofolio pengembangan sistem E-Transport.*
