import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { amount, currency, accountId, reference } = req.body;

        if (!amount || !currency || !accountId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['amount', 'currency', 'accountId']
            });
        }

        const client = createRevolutClient();
        const response = await client.post('/payments', {
            request_id: `payment_${Date.now()}`,
            account_id: accountId,
            amount: amount,
            currency: currency,
            reference: reference || 'AdsPower payment'
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Payment error:', error.response?.data || error);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
} 