import { createRevolutClient } from '../../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, spendingLimit = 1000 } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Card name is required'
            });
        }

        const client = await createRevolutClient();

        // Create a virtual card
        const cardResponse = await client.post('/cards', {
            type: 'VIRTUAL',
            name: name
        });

        // Set spending limit if specified
        if (spendingLimit) {
            await client.post(`/cards/${cardResponse.data.id}/spending-limits`, {
                amount: spendingLimit,
                currency: 'EUR',
                frequency: 'MONTHLY'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Virtual card created',
            card: {
                id: cardResponse.data.id,
                name: cardResponse.data.name,
                last4: cardResponse.data.last4,
                spendingLimit: {
                    amount: spendingLimit,
                    currency: 'EUR',
                    frequency: 'MONTHLY'
                }
            }
        });

    } catch (error) {
        console.error('Card creation error:', error.response?.data || error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create virtual card',
            error: error.response?.data?.message || error.message
        });
    }
} 