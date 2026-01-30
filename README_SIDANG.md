# Panduan Utama Dokumentasi Sidang: E-Transport PLN

Halo! Dokumen ini disiapkan khusus untuk membantu Anda dalam mempresentasikan sistem E-Transport PLN saat sidang nanti. Semua penjelasan teknis dan operasional telah dirangkum secara mendalam.

## 📚 Menu Dokumentasi
Silakan buka file-file berikut sesuai dengan kebutuhan penjelasan kepada penguji:

1. [**SYSTEM_FLOW.md**](file:///Users/nia/Documents/transport_pln/SYSTEM_FLOW.md)
   - *Gunakan ini untuk menjelaskan alur kerja aplikasi.*
   - Berisi diagram alur (Mermaid) mulai dari input pengajuan user sampai unit kembali ke kantor.
   - Menjelaskan sinkronisasi status antara tabel permohonan dan tabel armada.

2. [**FOLDER_STRUCTURE.md**](file:///Users/nia/Documents/transport_pln/FOLDER_STRUCTURE.md)
   - *Gunakan ini jika penguji bertanya tentang struktur kode.*
   - Menjelaskan implementasi Design Pattern **MVC (Model-View-Controller)** pada CodeIgniter.
   - Merinci fungsi-fungsi folder utama seperti `controllers`, `models`, dan `views`.

3. [**MODIFICATION_LOG.md**](file:///Users/nia/Documents/transport_pln/MODIFICATION_LOG.md)
   - *Gunakan ini untuk menunjukkan kontribusi pengembangan terbaru.*
   - Menjelaskan fitur-fitur unggulan seperti **Live Camera Capture**, **Logistik Otomatis**, dan perbaikan bug kritikal.

---

## 💡 Poin Penting untuk Sidang (Key Presentation Points)

### 1. Inovasi: Live Camera Capture
- Jelaskan bahwa sistem tidak hanya mengandalkan upload file statis, tetapi bisa mengambil foto langsung melalui browser (WebRTC). 
- Fitur ini meningkatkan **integritas data**, karena foto diambil pada saat itu juga (mengurangi risiko manipulasi foto lama).
- Mendukung "Front/Back Camera" untuk kemudahan penggunaan di mobile/smartphone oleh security.

### 2. Logika Bisnis: Otonomi Bidang
- Jelaskan bagaimana **Asmen** hanya bisa menyetujui bidang mereka masing-masing. Ini menunjukkan implementasi **Role-Based Access Control (RBAC)** yang matang.

### 3. Otomasi: Kalkulasi Logistik
- Tunjukkan bahwa sistem secara otomatis menghitung **Jarak Tempuh (KM)** dan **Durasi Perjalanan**. User tidak perlu menginput data ini secara manual, sehingga mengurangi kesalahan hitung (human error).

### 4. Dokumentasi Kode
- Jika penguji meminta membuka kode (source code), Anda bisa menunjukkan bahwa kode sudah sangat rapi dan memiliki komentar (comments) lengkap dalam bahasa Indonesia pada file-file berikut:
  - `application/models/Transport_model.php`
  - `application/controllers/Transport_request.php`
  - `application/controllers/Transport_approval.php`
  - `application/controllers/Transport_fleet.php`
  - `application/controllers/Transport_security.php`

---
*Semoga sidang Anda berjalan lancar dan mendapatkan hasil maksimal! Jika ada bagian yang perlu ditambahkan, silakan beritahu saya.* 🚀📈
