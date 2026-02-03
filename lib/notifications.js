import { prisma } from './prisma';

/**
 * Membuat notifikasi untuk role atau user tertentu
 * 
 * @param {Object} data - Data notifikasi yang akan dibuat
 * @param {string} data.role - Role yang akan menerima notifikasi
 * @param {number} data.userId - ID user (opsional)
 * @param {string} data.email - Email user (opsional)
 * @param {string} data.type - Jenis aktivitas (e.g. 'Permohonan Baru')
 * @param {string} data.module - Nama modul (default: 'Transport')
 * @param {number} data.recordId - ID record terkait
 * @param {string} data.recordName - Nama/Label record terkait
 * @param {string} data.description - Deskripsi detail notifikasi
 */
export async function createNotification({ role, userId, email, type, module = 'Transport', recordId, recordName, description }) {
    try {
        return await prisma.notifikasiAktivitas.create({
            data: {
                role,
                user_id: userId,
                email,
                jenis_aktivitas: type,
                module,
                record_id: recordId,
                record_name: recordName,
                deskripsi: description,
                tanggal_waktu: new Date(),
                status_baca: false
            }
        });
    } catch (err) {
        console.error('Gagal membuat notifikasi:', err);
    }
}

/**
 * Membuat notifikasi untuk semua user dengan role tertentu
 * 
 * @param {Array} roles - Daftar role yang akan menerima notifikasi (e.g. ['KKU', 'Security'])
 * @param {Object} data - Data notifikasi
 */
export async function notifyRoles(roles, data) {
    try {
        // Mapping data untuk createMany prisma
        const notifications = roles.map(role => ({
            role,
            jenis_aktivitas: data.type,
            module: data.module || 'Transport',
            record_id: data.recordId,
            record_name: data.recordName,
            deskripsi: data.deskripsi,
            tanggal_waktu: new Date(),
            status_baca: false
        }));

        // Simpan banyak notifikasi sekaligus ke database
        return await prisma.notifikasiAktivitas.createMany({
            data: notifications
        });
    } catch (err) {
        console.error('Gagal mengirim notifikasi ke role:', err);
    }
}
