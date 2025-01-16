import axios from 'axios';
import { generateJWT } from '../../../utils/revolut-auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const token = generateJWT();

        // Try both production and sandbox endpoints
        const productionClient = axios.create({
            baseURL: 'https://b2b.revolut.com/api/1.0',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            validateStatus: status => true // Don't throw on any status
        });

        const sandboxClient = axios.create({
            baseURL: 'https://sandbox-b2b.revolut.com/api/1.0',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            validateStatus: status => true // Don't throw on any status
        });

        const results = {
            token: {
                preview: token.substring(0, 50) + '...',
                length: token.length
            },
            production: null,
            sandbox: null,
            errors: {}
        };

        // Test production endpoint
        try {
            const prodResponse = await productionClient.get('/accounts');
            results.production = {
                status: prodResponse.status,
                statusText: prodResponse.statusText,
                headers: prodResponse.headers,
                data: prodResponse.data
            };
        } catch (error) {
            results.errors.production = {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            };
        }

        // Test sandbox endpoint
        try {
            const sandboxResponse = await sandboxClient.get('/accounts');
            results.sandbox = {
                status: sandboxResponse.status,
                statusText: sandboxResponse.statusText,
                headers: sandboxResponse.headers,
                data: sandboxResponse.data
            };
        } catch (error) {
            results.errors.sandbox = {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            };
        }

        // Add environment info
        results.environment = {
            clientId: process.env.REVOLUT_CLIENT_ID,
            apiMode: process.env.REVOLUT_API_ENVIRONMENT || 'production'
        };

        res.status(200).json(results);
    } catch (error) {
        console.error('Sandbox test error:', error);
        res.status(500).json({
            error: 'Sandbox test failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
} 