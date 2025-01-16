import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const privateKey = process.env.REVOLUT_PRIVATE_KEY;
        const publicCert = process.env.REVOLUT_PUBLIC_CERT;

        // Configure axios for Revolut API
        const revolutClient = axios.create({
            baseURL: 'https://b2b.revolut.com/api/1.0',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REVOLUT_CLIENT_ID}`,
            },
            cert: publicCert,
            key: privateKey,
        });

        res.status(200).json({ message: 'API endpoint ready' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 