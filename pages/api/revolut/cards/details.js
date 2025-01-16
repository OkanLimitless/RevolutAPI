import { createRevolutClient } from '../../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Card ID is required'
        });
    }

    try {
        const client = await createRevolutClient();
        
        // Get basic card info
        const cardResponse = await client.get(`/cards/${id}`);
        
        // Get sensitive card details
        const detailsResponse = await client.get(`/cards/${id}/details`);
        
        // Get spending limits
        const limitsResponse = await client.get(`/cards/${id}/spending-limits`);

        const card = {
            id: cardResponse.data.id,
            name: cardResponse.data.name,
            type: cardResponse.data.type,
            state: cardResponse.data.state,
            created_at: cardResponse.data.created_at,
            blocked: cardResponse.data.blocked,
            details: {
                number: detailsResponse.data.number,
                expiry: {
                    month: detailsResponse.data.expiry_month,
                    year: detailsResponse.data.expiry_year
                },
                cvv: detailsResponse.data.cvv
            },
            spendingLimits: limitsResponse.data
        };

        res.status(200).json({
            status: 'success',
            card
        });

    } catch (error) {
        console.error('Card details error:', {
            error: error.response?.data || error,
            status: error.response?.status,
            cardId: id
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to get card details',
            error: error.response?.data?.message || error.message
        });
    }
} 