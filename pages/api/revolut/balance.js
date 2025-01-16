import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get accounts first
        const accountsResponse = await client.get('/accounts');
        const accounts = accountsResponse.data;

        // Fetch balance for each account
        const accountsWithBalance = await Promise.all(
            accounts.map(async (account) => {
                try {
                    const balanceResponse = await client.get(`/accounts/${account.id}/balance`);
                    return {
                        accountId: account.id,
                        name: account.name || 'Main',
                        currency: account.currency,
                        balance: balanceResponse.data.amount,
                        available: balanceResponse.data.available
                    };
                } catch (error) {
                    console.error(`Balance fetch error for account ${account.id}:`, error.response?.data || error.message);
                    return {
                        accountId: account.id,
                        name: account.name || 'Main',
                        currency: account.currency,
                        error: error.response?.data?.message || 'Failed to fetch balance'
                    };
                }
            })
        );

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            accounts: accountsWithBalance
        });
    } catch (error) {
        console.error('Balance fetch error:', error.response?.data || error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch balances',
            timestamp: new Date().toISOString(),
            error: error.response?.data?.message || error.message
        });
    }
} 