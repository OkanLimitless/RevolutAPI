import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { from, to, count = 100 } = req.query;
        const client = createRevolutClient();
        
        const params = {
            count: count,
            ...(from && { from: from }),
            ...(to && { to: to })
        };

        const response = await client.get('/transactions', { params });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Transactions error:', error.response?.data || error);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
} 