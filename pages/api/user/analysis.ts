import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userWithAnalysis = user as any;
            if (userWithAnalysis.lastAnalysis) {
                return res.status(200).json(JSON.parse(userWithAnalysis.lastAnalysis));
            } else {
                return res.status(200).json(null);
            }
        } catch (error) {
            console.error('Error fetching analysis:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { email, analysis } = req.body;

        if (!email || !analysis) {
            return res.status(400).json({ error: 'Email and analysis data are required' });
        }

        try {
            await prisma.user.update({
                where: { email },
                data: { lastAnalysis: JSON.stringify(analysis) } as any
            });

            return res.status(200).json({ message: 'Analysis saved successfully' });
        } catch (error) {
            console.error('Error saving analysis:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
