/**
 * Fungsi untuk memformat ID agar mudah dibaca di tampilan (Frontend)
 * Menampilkan ID sequential dari #1 meskipun database ID loncat-loncat
 * 
 * Contoh: Database ID 120002 → Display #1, Database ID 120003 → Display #2
 * 
 * @param {string|number} rawId - ID mentah dari database
 * @param {number} minId - ID terkecil dalam dataset (opsional, default 120002)
 * @returns {string} - ID dalam bentuk string sequential
 */
export const formatDisplayId = (rawId, minId = null) => {
    if (!rawId) return '';
    const numId = parseInt(rawId);
    if (isNaN(numId)) return rawId;

    // Jika minId tidak disediakan, gunakan ID apa adanya
    // Ini akan di-override di komponen yang punya akses ke semua data
    if (minId === null) {
        return String(numId);
    }

    // Hitung offset dari ID minimum
    // Contoh: minId=120002, rawId=120002 → 120002-120002+1 = 1
    //         minId=120002, rawId=120003 → 120003-120002+1 = 2
    const displayId = numId - minId + 1;
    return String(displayId);
};

/**
 * Wrapper API untuk memudahkan request HTTP dari komponen Frontend
 */
export const api = {
    // Request GET
    get: (url) => request(url, { method: 'GET' }),
    // Request POST (untuk kirim data baru)
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    // Request PUT (untuk update data)
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    // - [/] Add password change feature for Admin
    // - [/] Create PATCH API endpoint for user updates
    // Request PATCH (untuk update sebagian data)
    patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
};

/**
 * Fungsi internal untuk menangani fetch request dengan header autentikasi otomatis
 * 
 * @param {string} url - Endpoint API
 * @param {Object} options - Opsi fetch (method, body, dll)
 */
async function request(url, options) {
    // Ambil token JWT dari localStorage jika ada
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        // Tambahkan header Authorization jika token tersedia
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });
        const text = await response.text();

        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Gagal parsing respon JSON:', text);
            if (!response.ok) {
                // Jika respon memang error dan bukan JSON, berikan info status code
                if (response.status === 413) {
                    throw new Error('Ukuran file/data terlalu besar (Payload Too Large)');
                }
                throw new Error(`Server Error (${response.status}): Respon tidak valid`);
            }
            throw new Error('Server mengembalikan respon yang tidak dapat diproses');
        }

        // Jika respon tidak OK (status 400-500)
        if (!response.ok) {
            let errorMessage = data.error || data.message || 'Terjadi kesalahan sistem';
            if (data.details) errorMessage += ` (Detail: ${data.details})`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (err) {
        console.error('Error saat request API:', err);
        throw err;
    }
}
