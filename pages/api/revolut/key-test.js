export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const privateKey = process.env.REVOLUT_PRIVATE_KEY;
        
        // Check key format
        const keyCheck = {
            length: privateKey?.length,
            hasCorrectHeader: privateKey?.includes('-----BEGIN PRIVATE KEY-----'),
            hasCorrectFooter: privateKey?.includes('-----END PRIVATE KEY-----'),
            hasLineBreaks: privateKey?.includes('\n'),
            format: {
                firstLine: privateKey?.split('\n')[0],
                numberOfLines: privateKey?.split('\n').length,
                lastLine: privateKey?.split('\n').slice(-1)[0]
            }
        };

        res.status(200).json({
            status: 'ok',
            keyCheck
        });
    } catch (error) {
        console.error('Key Test Error:', error);
        res.status(500).json({ error: 'Key test failed', message: error.message });
    }
} 