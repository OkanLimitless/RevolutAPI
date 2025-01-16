export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Check if we can read the environment variables
        const certLength = process.env.REVOLUT_PUBLIC_CERT?.length || 0;
        const keyLength = process.env.REVOLUT_PRIVATE_KEY?.length || 0;
        const clientId = process.env.REVOLUT_CLIENT_ID;

        res.status(200).json({
            status: 'ok',
            certPresent: certLength > 0,
            keyPresent: keyLength > 0,
            clientIdPresent: !!clientId,
            certLength,
            keyLength
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
} 