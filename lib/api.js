/**
 * Fungsi untuk memformat ID agar mudah dibaca di tampilan (Frontend)
 * Contoh: 1 -> "1", 2 -> "2"
 * 
 * @param {string|number} rawId - ID mentah dari database
 * @returns {string} - ID dalam bentuk string
 */
export const formatDisplayId = (rawId) => {
    if (!rawId) return '';
    const numId = parseInt(rawId);
    if (isNaN(numId)) return rawId;

    // Tampilan sederhana: 1, 2, 3 (tanpa padding nol di depan)
    return String(numId);
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
            data = JSON.parse(text);
        } catch (e) {
            console.error('Gagal parsing respon JSON:', text);
            throw new Error('Server mengembalikan respon JSON yang tidak valid');
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
