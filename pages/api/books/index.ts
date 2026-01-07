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

    // Basic "Authentication" via email in query/body (since we don't have proper session tokens yet for this simple migration)
    // Ideally we would verify a token, but here we can pass the email as a simple identifier from the frontend.
    // The frontend has the user email after login.

    if (req.method === 'GET') {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email param required' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { books: true },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user.books);
        } catch (error) {
            console.error('Error fetching books:', error);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    if (req.method === 'POST') {
        const { email, book } = req.body;

        if (!email || !book) {
            return res.status(400).json({ error: 'Missing data' });
        }

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(404).json({ error: 'User not found' });

            const newBook = await prisma.book.create({
                data: {
                    title: book.title,
                    author: book.author,
                    genre: book.genre,
                    thumbnail: book.thumbnail,
                    description: book.description,
                    rating: book.rating || 0,
                    publicationYear: book.publicationYear,
                    userId: user.id
                }
            });

            return res.status(201).json(newBook);
        } catch (error) {
            console.error('Error adding book:', error);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
