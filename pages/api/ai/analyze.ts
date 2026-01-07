import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            // Forward the request to the Python backend
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Python Backend Error:', errorText);
                return res.status(response.status).json({ error: errorText });
            }

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error('AI Proxy Error:', error);
            return res.status(500).json({ error: 'Failed to communicate with AI service' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
