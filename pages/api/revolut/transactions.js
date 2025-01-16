import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get transactions from the last 30 days
        const from = new Date();
        from.setDate(from.getDate() - 30);
        
        const params = {
            from: from.toISOString().split('T')[0], // Format: YYYY-MM-DD
            to: new Date().toISOString().split('T')[0],
            count: 50  // Limit to 50 transactions
        };

        console.log('Fetching transactions with params:', params);

        const response = await client.get('/transactions', { params });
        
        const transactions = response.data.map(tx => ({
            id: tx.id,
            type: tx.type,
            state: tx.state,
            amount: tx.amount,
            currency: tx.currency,
            created_at: tx.created_at,
            completed_at: tx.completed_at,
            reference: tx.reference,
            counterparty: tx.counterparty ? {
                name: tx.counterparty.name,
                account_type: tx.counterparty.account_type
            } : null,
            merchant: tx.merchant || null
        }));

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('Transactions fetch error:', {
            error: error.response?.data || error,
            status: error.response?.status,
            message: error.message
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch transactions',
            timestamp: new Date().toISOString(),
            error: error.response?.data?.message || error.message
        });
    }
} 