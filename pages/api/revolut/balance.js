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

        console.log('Accounts response:', accounts);  // Debug log

        // Fetch balance for each account
        const accountsWithBalance = await Promise.all(
            accounts.map(async (account) => {
                try {
                    // Use account.id instead of accountId
                    const balanceResponse = await client.get(`/accounts/${account.id}/balance`);
                    console.log(`Balance for account ${account.id}:`, balanceResponse.data);  // Debug log
                    
                    return {
                        id: account.id,  // Use consistent field name
                        accountId: account.id,
                        name: account.name || 'Main',
                        currency: account.currency,
                        balance: balanceResponse.data.amount,
                        available: balanceResponse.data.available,
                        state: account.state,
                        public: account.public
                    };
                } catch (error) {
                    console.error(`Balance fetch error for account ${account.id}:`, {
                        error: error.response?.data || error.message,
                        status: error.response?.status,
                        url: `/accounts/${account.id}/balance`
                    });
                    
                    return {
                        id: account.id,
                        accountId: account.id,
                        name: account.name || 'Main',
                        currency: account.currency,
                        error: error.response?.data?.message || 'Failed to fetch balance',
                        state: account.state,
                        public: account.public
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
        console.error('Balance fetch error:', {
            error: error.response?.data || error,
            status: error.response?.status,
            message: error.message
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch balances',
            timestamp: new Date().toISOString(),
            error: error.response?.data?.message || error.message
        });
    }
} 