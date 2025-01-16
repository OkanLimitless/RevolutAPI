import { generateJWT } from '../../../utils/revolut-auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const token = generateJWT();
        const [header, payload, signature] = token.split('.');
        
        res.status(200).json({
            status: 'ok',
            tokenParts: {
                header: Buffer.from(header, 'base64').toString(),
                payload: Buffer.from(payload, 'base64').toString(),
                signatureLength: signature.length
            },
            fullToken: token
        });
    } catch (error) {
        console.error('Debug Error:', error);
        res.status(500).json({
            error: 'JWT generation failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
} 