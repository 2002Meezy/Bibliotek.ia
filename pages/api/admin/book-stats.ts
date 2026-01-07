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

    if (req.method === 'GET') {
        try {
            // 1. Top Genres
            const topGenres = await prisma.book.groupBy({
                by: ['genre'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            });

            // 2. Top Authors
            const topAuthors = await prisma.book.groupBy({
                by: ['author'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            });

            // 3. Books by Publication Year
            // Note: publicationYear is a string, so we might get some messy data if not standardized, 
            // but for now we group by what we have.
            const booksByYear = await prisma.book.groupBy({
                by: ['publicationYear'],
                _count: {
                    id: true,
                },
                orderBy: {
                    publicationYear: 'asc', // Determine order logic, maybe desc ensures recent are seen? or asc for timeline
                },
                // Filter out nulls if possible, or handle in frontend
                where: {
                    publicationYear: {
                        not: null
                    }
                },
                take: 10, // Limit to top 10 years or just all? Let's take 20 most frequent or just 20. 
                // Actually groupBy orderBy count might be better to see "Most consumed eras"
            });

            // Let's re-order years by count for "Most consumed eras"
            const booksByYearPopularity = await prisma.book.groupBy({
                by: ['publicationYear'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc'
                    }
                },
                where: {
                    publicationYear: {
                        not: null
                    }
                },
                take: 10,
            });



            // 4. Top Books (Most present titles)
            const topBooks = await prisma.book.groupBy({
                by: ['title'],
                _count: {
                    id: true,
                },
                orderBy: {
                    _count: {
                        id: 'desc',
                    },
                },
                take: 5,
            });

            return res.status(200).json({
                topGenres,
                topAuthors,
                booksByYear: booksByYearPopularity,
                topBooks
            });
        } catch (error) {
            console.error('Error fetching book stats:', error);
            return res.status(500).json({ error: 'Internal error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
