import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Try to get permissions/scopes
        const response = await client.get('/auth/permissions');
        
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            permissions: response.data
        });

    } catch (error) {
        console.error('Permissions check error:', {
            error: error.response?.data || error,
            status: error.response?.status
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to check permissions',
            error: error.response?.data?.message || error.message
        });
    }
} 