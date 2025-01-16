import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get API info
        const infoResponse = await client.get('/api-info');
        
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            api_info: infoResponse.data
        });

    } catch (error) {
        console.error('API info error:', {
            error: error.response?.data || error,
            status: error.response?.status
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to get API info',
            error: error.response?.data?.message || error.message
        });
    }
} 