# E-Transport PLN UP2D RIAU

Sistem Manajemen Kendaraan Dinas Digital yang dirancang untuk efisiensi operasional di lingkungan PLN UP2D Riau.

## 🚀 Fitur Utama
- **Digital Branding**: Login page modern dengan identitas PLN yang kuat.
- **Role-Based Access Control**: Manajemen hak akses untuk Admin, Asmen, KKU, Admin Fleet, dan Security.
- **Smart Approval**: Alur persetujuan berjenjang sesuai dengan Bidang/Bagian user.
- **Fleet Control & Monitoring**: Penugasan unit (Innova Zenix, Terios, dll) dan pengemudi secara real-time.
- **Security Check Point**: Integrasi Live Camera Capture (WebRTC) untuk dokumentasi foto driver dan odometer (KM) saat kendaraan berangkat (Check-in) dan kembali (Check-out).
- **Digital Signature**: QR Code pada surat jalan yang memvalidasi waktu pengajuan, persetujuan, dan penetapan unit.

## 🛠️ Teknologi
### Modern Stack (Frontend & API)
- **Framework**: Next.js 16.1 (App Router)
- **Database ORM**: Prisma
- **Styling**: Tailwind CSS 4 & Custom UI Components
- **Auth**: JWT (JSON Web Token)
- **Camera**: WebRTC API

### Legacy Stack (Internal Modules)
- **Framework**: PHP (CodeIgniter 3)
- **Database**: MySQL

## ⚙️ Instalasi
### 1. Database
- Import `database.sql` ke MySQL.
- Pastikan tabel `transport_requests`, `transport_approvals`, `transport_fleet`, dan `transport_security_logs` sudah tersedia.

### 2. Frontend & Next.js API
```bash
cd frontend
npm install
npx prisma generate
npm run dev
```

### 3. Konfigurasi Environment
Buat file `frontend/.env.local`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/db_name"
JWT_SECRET="your_secret_key"
```

---
*Developed for PLN UP2D RIAU - Final Project Presentation.*
