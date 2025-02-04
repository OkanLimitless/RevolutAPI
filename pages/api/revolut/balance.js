import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get accounts first
        const accountsResponse = await client.get('/accounts');
        console.log('Accounts Response:', accountsResponse.data);  // Debug log
        const accounts = accountsResponse.data;

        // Fetch balance for each account
        const accountsWithBalance = await Promise.all(
            accounts.map(async (account) => {
                try {
                    // Get balance directly from account data
                    return {
                        id: account.id,
                        accountId: account.id,
                        name: account.name || 'Main Account',
                        currency: account.currency,
                        balance: account.balance,
                        available: account.available,
                        state: account.state,
                        public: account.public
                    };
                } catch (error) {
                    console.error(`Balance error for account ${account.id}:`, error);
                    return {
                        id: account.id,
                        accountId: account.id,
                        name: account.name || 'Main Account',
                        currency: account.currency,
                        error: error.response?.data?.message || 'Failed to fetch balance',
                        state: account.state,
                        public: account.public
                    };
                }
            })
        );

        console.log('Final accounts data:', accountsWithBalance);  // Debug log

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