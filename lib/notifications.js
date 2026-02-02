import { prisma } from './prisma';

/**
 * Creates a notification for a specific role or user
 * @param {Object} data Notification data
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
        console.error('Failed to create notification:', err);
    }
}

/**
 * Creates notifications for all users with specified roles
 * @param {Array} roles Array of roles to notify
 * @param {Object} data Notification data
 */
export async function notifyRoles(roles, data) {
    try {
        const notifications = roles.map(role => ({
            ...data,
            role,
            tanggal_waktu: new Date(),
            status_baca: false
        }));

        return await prisma.notifikasiAktivitas.createMany({
            data: notifications
        });
    } catch (err) {
        console.error('Failed to notify roles:', err);
    }
}
