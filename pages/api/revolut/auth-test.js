import { generateJWT } from '../../../utils/revolut-auth';
import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Test JWT generation
        const token = generateJWT();
        const [header, payload, signature] = token.split('.');

        // Decode the JWT parts
        const decodedHeader = Buffer.from(header, 'base64').toString();
        const decodedPayload = Buffer.from(payload, 'base64').toString();

        // Test API connection
        const client = createRevolutClient();
        let apiResponse = null;
        let apiError = null;

        try {
            const response = await client.get('/accounts');
            apiResponse = {
                status: response.status,
                headers: response.headers,
                data: response.data
            };
        } catch (error) {
            apiError = {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            };
        }

        res.status(200).json({
            token: {
                full: token,
                parts: {
                    header,
                    payload,
                    signature
                }
            },
            decoded: {
                header: JSON.parse(decodedHeader),
                payload: JSON.parse(decodedPayload)
            },
            apiTest: {
                success: apiResponse !== null,
                response: apiResponse,
                error: apiError
            },
            environment: {
                clientId: process.env.REVOLUT_CLIENT_ID,
                hasPrivateKey: !!process.env.REVOLUT_PRIVATE_KEY,
                privateKeyLength: process.env.REVOLUT_PRIVATE_KEY?.length
            }
        });
    } catch (error) {
        console.error('Auth test error:', error);
        res.status(500).json({
            error: 'Auth test failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
} 