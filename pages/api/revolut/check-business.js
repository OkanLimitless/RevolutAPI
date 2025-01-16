import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get business info
        const businessResponse = await client.get('/business');
        
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            business_info: businessResponse.data
        });

    } catch (error) {
        console.error('Business check error:', {
            error: error.response?.data || error,
            status: error.response?.status
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to check business info',
            error: error.response?.data?.message || error.message
        });
    }
} 