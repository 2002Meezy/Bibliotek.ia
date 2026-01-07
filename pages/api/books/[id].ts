import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const bookId = parseInt(id);

    if (req.method === 'DELETE') {
        try {
            await prisma.book.delete({
                where: { id: bookId }
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Error deleting book' });
        }
    }

    if (req.method === 'PUT') {
        const { rating, status, description } = req.body;
        try {
            const updated = await prisma.book.update({
                where: { id: bookId },
                data: {
                    ...(rating !== undefined && { rating }),
                    ...(status !== undefined && { status }),
                    ...(description !== undefined && { description })
                }
            });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Error updating book' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
