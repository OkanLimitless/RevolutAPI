import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get issuing settings
        const settingsResponse = await client.get('/issuing/settings');
        
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            issuing_settings: settingsResponse.data
        });

    } catch (error) {
        console.error('Issuing check error:', {
            error: error.response?.data || error,
            status: error.response?.status
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to check issuing settings',
            error: error.response?.data?.message || error.message
        });
    }
} 