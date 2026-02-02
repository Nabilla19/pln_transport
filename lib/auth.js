import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyAuth(req) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}
