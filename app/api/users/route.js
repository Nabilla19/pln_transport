import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/lib/auth';

// GET all users (Admin only)
export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// POST create new user (Admin only)
export async function POST(request) {
    try {
        const user = await verifyAuth(request);

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const { name, email, password, role } = await request.json();

        // Validation
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('POST /api/users error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
