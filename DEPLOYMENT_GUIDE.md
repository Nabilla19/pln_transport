# TUTORIAL DEPLOYMENT: VERCEL + TIDB CLOUD (FREE)

Ikuti langkah-langkah di bawah ini untuk mengonlinekan aplikasi E-Transport Anda secara gratis selamanya.

---

## 💎 Langkah 1: Siapkan Database di TiDB Cloud
TiDB adalah database MySQL-compatible yang sangat cepat dan gratis.

1.  **Daftar/Login**: Buka [TiDB Cloud](https://pingcap.com/tidb-cloud).
2.  **Buat Cluster**: Pilih **"Create a Cluster"** > Pilih **"Serverless"** (Gratis).
3.  **Region**: Pilih yang terdekat (Contoh: Singapore atau Tokyo).
4.  **Dapatkan Password**: Simpan password database yang muncul di layar (Penting!).
5.  **Ambil Connection String**:
    - Cari tombol **"Connect"**.
    - Pilih **"Connect with Prisma"**.
    - Anda akan mendapatkan URL seperti: 
      `mysql://[USER]:[PASSWORD]@[HOST]:4000/[DB_NAME]?sslaccept=strict`
    - **Salin URL ini.**

---

## 📂 Langkah 2: Migrasi Struktur ke Cloud
Lakukan ini dari terminal laptop Anda (VS Code) agar database online Anda punya tabel-tabelnya.

1.  Buka terminal di VS Code.
2.  Ubah sementara isi `.env` Anda dengan URL dari TiDB tadi.
3.  Jalankan perintah ini:
    ```bash
    npx prisma db push
    ```
    *(Ini akan membuat semua tabel di cloud tanpa data lama, agar database cloud bersih).*

---

## 🧹 Langkah 2.5: Bersihkan Data Dummy (PENTING!)
**Lakukan ini SEBELUM deployment ke production jika database lokal Anda masih ada data dummy/testing.**

> ⚠️ **PERINGATAN**: Pastikan backup database terlebih dahulu!

1.  **Backup Database Lokal**:
    - Export database Anda terlebih dahulu sebagai backup
    - Via phpMyAdmin: Export > SQL > Go
    
2.  **Jalankan Script Cleanup**:
    - Buka file `migrations/clean_all_dummy_data.sql`
    - Copy seluruh isi script
    - Paste dan jalankan di phpMyAdmin atau MySQL Workbench
    
3.  **Verifikasi Hasil**:
    - Script akan menampilkan jumlah data di setiap tabel
    - Pastikan semua tabel permohonan menunjukkan **0 records**
    - Pastikan tabel master (users, vehicles) masih ada datanya
    
4.  **Apa yang Dihapus**:
    - ✅ Semua permohonan transport
    - ✅ Semua approval
    - ✅ Semua fleet assignments
    - ✅ Semua security logs
    - ✅ Semua notifikasi
    
5.  **Apa yang TIDAK Dihapus**:
    - ✅ Data users/pegawai
    - ✅ Data kendaraan
    - ✅ Data roles
    
Setelah cleanup, permohonan baru akan mulai dari ID #1 dengan database yang bersih!

---

## 🚀 Langkah 3: Hubungkan ke Vercel
Vercel akan mengambil kode dari GitHub Anda secara otomatis.

1.  **Login ke Vercel**: Gunakan akun GitHub Anda di [Vercel.com](https://vercel.com).
2.  **Import Project**: Klik **"Add New"** > **"Project"** > Pilih `Nabilla19/pln_transport`.
3.  **Konfigurasi Variabel (Environment Variables)**:
    - Masukkan `DATABASE_URL`: (Isi dengan URL TiDB tadi).
    - Masukkan `JWT_SECRET`: (Isi bebas, contoh: `pln_up2d_2026`).
4.  **Klik "Deploy"**: Tunggu sekitar 2-3 menit.

---

## ✅ Langkah 4: Selesai!
Vercel akan memberikan Anda link website (Contoh: `https://pln-transport-nia.vercel.app`).
- Link ini bisa dibuka dari HP, Laptop pimpinan, atau saat Sidang.
- Data yang Anda masukkan di web tersebut akan tersimpan permanen di TiDB Cloud.

---
### 💡 Tips Penting:
- **Keamanan**: Jangan pernah membagikan password database Anda kepada orang lain.
- **Update**: Jika Anda mengubah kode di laptop dan melakukan `git push`, Vercel akan otomatis memperbarui website Anda dalam hitungan detik.

*Selamat! Aplikasi Anda sekarang sudah Go-Live!* 🌍🚀
