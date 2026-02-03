export const formatDisplayId = (rawId) => {
    if (!rawId) return '';
    const numId = parseInt(rawId);
    if (isNaN(numId)) return rawId;

    // Starts from 1 by subtracting the base 90,000 as requested
    const displayId = numId >= 90000 ? (numId - 90000) : numId;

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
