# TECHNICAL DOCUMENTATION: E-TRANSPORT SYSTEM

Dokumen ini berisi spesifikasi teknis mendalam mengenai arsitektur, database, dan implementasi kode pada sistem E-Transport PLN UP2D Riau.

---

## 1. SISTEM ARSITEKTUR
Sistem ini dibangun menggunakan **Modern Full-Stack Architecture** dengan fokus pada performa dan keamanan.

- **Frontend & Backend Hosting**: Next.js 16.1 (App Router).
- **Runtime Environment**: Node.js.
- **Data Persistence**: Prisma ORM dengan MySQL.
- **Client-Side Storage**: LocalStorage (Session Management).

---

## 2. SPESIFIKASI DATABASE (SQL & PRISMA)
Database menggunakan MySQL dengan relasi yang ketat untuk menjaga integritas data perjalanan dinas.

### A. Skema Tabel Utama
1.  **`users`**: Manajemen autentikasi dan peran (Admin, Asmen, KKU, Security, Bidang).
2.  **`transport_requests`**: Master data permohonan transportasi.
3.  **`transport_approvals`**: Log digital persetujuan pimpinan.
4.  **`transport_fleet`**: Manajemen penugasan unit armada dan driver.
5.  **`transport_security_logs`**: Log operasional check-in/out dan bukti visual (Base64/Storage).
6.  **`transport_vehicles`**: Data inventory kendaraan operasional.

### B. Prisma Model (Snippet)
```prisma
model TransportRequest {
  id                    Int      @id @default(autoincrement())
  nama                  String
  bagian                String
  tujuan                String
  tanggal_jam_berangkat DateTime
  status                String   @default("Pending Asmen")
  // ... relasi lainnya
}
```

---

## 3. IMPLEMENTASI FITUR UTAMA

### A. Live Camera Capture (WebRTC)
Menggunakan API `navigator.mediaDevices.getUserMedia` untuk mengakses kamera secara langsung di browser tanpa plugin tambahan.
- **Format**: Image Captured dikonversi menjadi format JPEG.
- **Penyimpanan**: Disimpan di folder `/public/uploads/transport/` dengan penamaan berbasis UUID/Timestamp.

### B. Digital Signature & Verification (QR Code)
Implementasi QR Code menggunakan library JavaScript untuk meng-encode data validasi:
- **Payload**: Berisi ID Permohonan + Tanggal Persetujuan (ISO String) + URL Verifikasi.
- **Security**: QR Code unik untuk setiap tahap (Pemohon, Approver, Fleet).

---

## 4. SECURITY & AUTHENTIKASI
- **Autentikasi**: Menggunakan **JSON Web Token (JWT)** yang ditandatangani dengan `JWT_SECRET`.
- **Enkripsi**: Password user dienkrpisi menggunakan algoritma **Bcrypt** (Salt rounds: 10).
- **Middleware**: Validasi Role dilakukan di tingkat API Route (`verifyAuth.js`) untuk mencegah akses ilegal.

---

## 5. STRUKTUR PROYEK (JS FOLDER)
- `/app/api/`: Endpoint RESTful untuk semua operasi CRUD.
- `/app/request/`: Halaman pengajuan dan manajemen permohonan.
- `/components/`: Reusable UI components (Shell, Sidebar, Toast, Camera).
- `/lib/`: Utility classes (Prisma Client, Auth Helper).

---
*Technical Documentation Version 2.0 (Full-JS Migration) - Updated Feb 2026*
