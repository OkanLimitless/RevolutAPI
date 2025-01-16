import { createRevolutClient } from '../../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, spendingLimit = 90 } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Card name is required'
            });
        }

        const client = await createRevolutClient();

        // First, check if we can create cards
        const cardsResponse = await client.get('/cards');
        console.log('Cards API response:', {
            status: cardsResponse.status,
            data: cardsResponse.data
        });

        // Create a virtual card with updated payload
        const cardResponse = await client.post('/corporate-cards', {
            type: 'VIRTUAL',
            currency: 'EUR',
            name: name,
            spend_limit: {
                value: spendingLimit * 100,
                currency: 'EUR',
                frequency: 'MONTHLY'
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Virtual card created',
            card: {
                id: cardResponse.data.id,
                name: cardResponse.data.card_name,
                last4: cardResponse.data.last4,
                spendingLimit: {
                    amount: spendingLimit,
                    currency: 'EUR',
                    frequency: 'MONTHLY'
                }
            }
        });

    } catch (error) {
        console.error('Card creation error:', {
            error: error.response?.data || error,
            status: error.response?.status,
            headers: error.response?.headers,
            request: {
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data
            }
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to create virtual card',
            error: error.response?.data?.message || error.message
        });
    }
} 