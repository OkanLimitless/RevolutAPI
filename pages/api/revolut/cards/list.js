import { createRevolutClient } from '../../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get all cards
        const response = await client.get('/cards');
        
        // Format and filter virtual cards
        const cards = response.data
            .filter(card => card.type === 'VIRTUAL')
            .map(card => ({
                id: card.id,
                name: card.name,
                last4: card.last4,
                state: card.state,
                created_at: card.created_at,
                blocked: card.blocked,
                spendingLimits: card.spending_limits
            }));

        res.status(200).json({
            status: 'success',
            count: cards.length,
            cards
        });

    } catch (error) {
        console.error('Card list error:', error.response?.data || error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list cards',
            error: error.response?.data?.message || error.message
        });
    }
} 