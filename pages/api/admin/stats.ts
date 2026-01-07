import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const totalUsers = await prisma.user.count();
        const totalAdmins = await prisma.user.count({
            where: { role: 'admin' },
        });

        return res.status(200).json({
            total_users: totalUsers,
            total_admins: totalAdmins,
            active_now: 1, // Placeholder
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
