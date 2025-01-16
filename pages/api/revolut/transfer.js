import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { sourceAccountId, targetAccountId, amount, currency } = req.body;

        if (!sourceAccountId || !targetAccountId || !amount || !currency) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['sourceAccountId', 'targetAccountId', 'amount', 'currency']
            });
        }

        const client = createRevolutClient();
        const response = await client.post('/transfer', {
            source_account_id: sourceAccountId,
            target_account_id: targetAccountId,
            amount: amount,
            currency: currency,
            reference: 'AdsPower automation transfer'
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Transfer error:', error.response?.data || error);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error'
        });
    }
} 