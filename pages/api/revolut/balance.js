import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();

        // Get accounts first
        const accountsResponse = await client.get('/accounts');
        
        // Get balances for each account
        const balances = await Promise.all(
            accountsResponse.data.map(async (account) => {
                try {
                    // Get detailed balance for each account
                    const balanceResponse = await client.get(`/accounts/${account.id}/balance`);
                    
                    return {
                        accountId: account.id,
                        name: account.name,
                        currency: account.currency,
                        balance: balanceResponse.data.amount,
                        available: balanceResponse.data.available,
                        reserved: balanceResponse.data.reserved,
                        type: account.type,
                        state: account.state,
                        created_at: account.created_at,
                        updated_at: account.updated_at
                    };
                } catch (error) {
                    console.error(`Error fetching balance for account ${account.id}:`, error);
                    return {
                        accountId: account.id,
                        name: account.name,
                        currency: account.currency,
                        error: 'Failed to fetch balance'
                    };
                }
            })
        );

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            accounts: balances
        });
    } catch (error) {
        console.error('Balance check error:', error.response?.data || error);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || 'Failed to fetch balances',
            timestamp: new Date().toISOString(),
            error: error.response?.data || error.message
        });
    }
} 