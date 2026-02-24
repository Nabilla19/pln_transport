# 🪟 Panduan Lengkap Deployment SI-PINTER di Server PLN (Windows)

Panduan ini berisi langkah-langkah **dari nol** setelah kamu masuk ke Server Windows PLN via Remote Desktop (RDP), dengan tujuan:
1. Memindahkan Database ke Server Lokal (MySQL).
2. Menghidupkan Aplikasi SI-PINTER (Node.js).
3. Membuka Akses Publik via Nginx (IP: 103.42.40.5).

---

## 🛠️ TAHAP 1: Memastikan Aplikasi Pendukung Terinstall

Di dalam layar Server PLN, buka **PowerShell** (Klik tombol Start -> Ketik `powershell` -> Klik Kanan -> **Run as Administrator**).
Ketik perintah ini satu per satu untuk mengecek:
1. `node -v` (Pastikan muncul angka versi, misal v22.x)
2. `git --version` (Pastikan muncul angka versi Git)
3. `pm2 -v` (Pastikan muncul angka versi PM2)

*(Jika salah satu error/merah, download dan install dulu dari browser Google Chrome di server tersebut).*

---

## 🗄️ TAHAP 2: Membuat Database & Memasukkan Data Lama (Backup)

Kita akan memindahkan data dari Cloud TiDB ke dalam MySQL yang ada di Server PLN.

### Langkah 2.1: Bikin Ruangan Databasenya
Di layar **PowerShell** tadi, ketik:
```powershell
mysql -u root -p
```
*(Tekan **Enter**. Jika minta password, kosongi saja dan tekan Enter lagi. Jika error "Access Denied", tanyakan password root MySQL ke IT PLN).*

Setelah masuk (tulisan berubah jadi `mysql>`), ketik ini lalu Enter:
```sql
CREATE DATABASE pln_transport;
```

### Langkah 2.2: Masukkan Kelengkapan Data Lama (Restore)
Aku sudah menyertakan file backup data lama bernama `backup_tidb_2026-02-23...` di dalam kodingan. 

Untuk sekarang, **ketik `exit`** (lalu Enter) untuk keluar dari MySQL dulu. Kita harus download kodenya dulu di Tahap 3 biar file backupnya ada di server!

---

## 📥 TAHAP 3: Menarik Kode dari GitHub & Menyambung Database

Masih di **PowerShell**, mari kita download kodingan SI-PINTER dan letakkan di folder `C:\SI-Pinter`:

```powershell
cd C:\
mkdir SI-Pinter
cd SI-Pinter
git clone https://github.com/Nabilla19/pln_transport.git
cd pln_transport
```
*(Jika muncul prompt login GitHub, masukkan username/password kamu).*

### Langkah 3.2: Menyambungkan Kabel Database (File `.env`)
1. Buka **File Explorer** (ikon folder kuning).
2. Arahkan ke: `Local Disk (C:)` 👉 `SI-Pinter` 👉 `pln_transport`.
3. Buka file bernama **`.env`** menggunakan aplikasi **Notepad**.
4. Ubah isinya menjadi persis seperti ini:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/pln_transport"
   JWT_SECRET="pln_up2dr_2024"
   NEXT_PUBLIC_APP_URL="http://103.42.40.5"
   ```
   *(Catatan: Jika MySQL server tadi pakai password, ubah `root:@` menjadi `root:PASSWORDNYA@`)*.
5. Save (Ctrl+S) dan tutup Notepad.

### Langkah 3.3: Memasukkan Data Backup ke Database
Sekarang file kodenya sudah ada. Balik lagi ke **PowerShell** yang posisinya sedang di `C:\SI-Pinter\pln_transport>`.

Ketik ini untuk masuk MySQL lagi:
```powershell
mysql -u root -p
```
*(Enter)*

Setelah tulisan `mysql>`, ketik ini (Sesuaikan nama file tanggal backupnya dengan yang ada di folder):
```sql
USE pln_transport;
source C:/SI-Pinter/pln_transport/backup_tidb_2026-02-23T06-35-17-350Z.sql;
exit
```

---

## 🚀 TAHAP 4: Menyalakan Mesin Aplikasi

Posisi sekarang kakak sudah keluar dari MySQL dan kembali ke folder `C:\SI-Pinter\pln_transport>` di PowerShell.

Ketik jurus ini berurutan (tunggu tiap baris sampai proses loadingnya selesai):
```powershell
npm install
```
```powershell
npx prisma generate
```
```powershell
npm run build
```
```powershell
pm2 start npm --name "si-pinter" -- start
```
*(Pastikan muncul tabel Hijau bertuliskan "online")*.

```powershell
pm2 save
```

**(SAMPAI SINI WEB SUDAH MENYALA DI DALAM SERVER DI `http://localhost:3000`)**

---

## 🌐 TAHAP 5: Mengaktifkan Akses Publik via Nginx

Tujuan akhirnya adalah agar web terbuka saat orang mengetik IP `103.42.40.5` di HP mereka dari rumah.

1. Buka **File Explorer**.
2. Cari lokasi folder instalasi Nginx di komputer server tersebut. (Biasanya ada di `C:\nginx\` atau di dalam `C:\xampp\nginx\`).
3. Buka folder `conf`, cari file bernama **`nginx.conf`**.
4. Klik Kanan -> **Open With** -> **Notepad**.
5. Scroll sampai paling bawah. **Tepat sebelum** kurung kurawal penutup paling akhir `}`, tambahkan kode pengaturan ini:

```nginx
server {
    listen 80;
    server_name 103.42.40.5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Save** (Ctrl+S) dan tutup Notepad.
7. Di PowerShell, restart Nginx agar mendeteksi pengaturan baru. Ketik:
   ```powershell
   nginx -s reload
   ```
   *(Atau bisa juga dengan merestart service Nginx lewat aplikasi XAMPP/Windows Services).*

**SELESAI! 🎉** 
SI-PINTER 100% sudah siap diakses oleh siapapun melalui IP `103.42.40.5`.
