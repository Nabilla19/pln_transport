import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        console.log('🔐 Login attempt for:', email);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('❌ User not found:', email);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        console.log('✅ User found:', user.name, user.email);
        console.log('🔑 Password hash from DB:', user.password.substring(0, 20) + '...');
        console.log('🔑 Password provided:', password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔍 Password match:', isMatch);

        if (!isMatch) {
            console.log('❌ Password mismatch');
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ Login successful for:', user.email);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('💥 Login error:', err);
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
