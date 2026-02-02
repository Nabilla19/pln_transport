import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// DELETE user by ID (Admin only)
export async function DELETE(request, { params }) {
    try {
        const user = await verifyAuth(request);

        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const { id } = params;
        const userId = parseInt(id);

        // Prevent admin from deleting themselves
        if (userId === adminUser.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/users/[id] error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
