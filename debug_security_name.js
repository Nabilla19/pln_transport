// Test API Security - Debugging Script
// Jalankan ini di browser console untuk cek apakah API menyimpan nama security

// 1. Cek user yang sedang login
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current User:', user);
console.log('User Name:', user?.name);
console.log('User Role:', user?.role);

// 2. Cek token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// 3. Test decode JWT (manual check)
// Buka https://jwt.io dan paste token untuk lihat payload
// Pastikan ada field "name" di dalam token

// 4. Setelah check-in, cek response API
// Buka Network tab di DevTools
// Filter: /api/security
// Lihat Request Payload: apakah ada user.name?
// Lihat Response: apakah sukses?

// 5. Cek data di database (via SQL)
// SELECT * FROM transport_security_logs ORDER BY id DESC LIMIT 1;
// Pastikan security_berangkat terisi

console.log('=== DEBUG COMPLETE ===');
console.log('Jika user.name adalah NULL atau undefined, berarti masalah di JWT token');
console.log('Jika user.name ada tapi tidak tersimpan, berarti masalah di API atau database');
