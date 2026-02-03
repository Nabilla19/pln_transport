export const formatDisplayId = (rawId) => {
    if (!rawId) return '';
    const numId = parseInt(rawId);
    if (isNaN(numId)) return rawId;

    // Use modulo 30000 to handle jumps in database ID (common in TiDB/Cloud DBs)
    // This ensures that 30001, 60001, etc. all display as "001"
    const displayId = ((numId - 1) % 30000) + 1;

    return String(displayId).padStart(3, '0');
};

export const api = {
    get: (url) => request(url, { method: 'GET' }),
    post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
};

async function request(url, options) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
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
            console.error('Failed to parse JSON response:', text);
            throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok) {
            const errorMessage = data.error || data.message || 'Something went wrong';
            throw new Error(errorMessage);
        }

        return data;
    } catch (err) {
        console.error('API Request Error:', err);
        throw err;
    }
}
