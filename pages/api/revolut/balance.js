import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Get accounts first
        const accountsResponse = await client.get('/accounts');
        console.log('Accounts Response:', accountsResponse.data);
        const accounts = accountsResponse.data;

        // Only keep EUR and USD accounts
        const filteredAccounts = accounts.filter(account => 
            (account.currency === 'EUR' || account.currency === 'USD') &&
            account.balance > 0
        );

        // Fetch balance for each account
        const accountsWithBalance = await Promise.all(
            filteredAccounts.map(async (account) => {
                try {
                    // Make separate request for balance
                    const balanceResponse = await client.get(`/accounts/${account.id}`);
                    console.log(`Balance for account ${account.id}:`, balanceResponse.data);

                    // Convert cents to whole numbers
                    const balance = balanceResponse.data.balance / 100;
                    const available = balanceResponse.data.balance / 100;

                    return {
                        id: account.id,
                        accountId: account.id,
                        name: account.name || 'Main Account',
                        currency: account.currency,
                        balance: balance,
                        available: available,
                        state: account.state,
                        public: account.public
                    };
                } catch (error) {
                    console.error(`Balance error for account ${account.id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null results and sort by balance
        const validAccounts = accountsWithBalance
            .filter(account => account !== null)
            .sort((a, b) => b.balance - a.balance);

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            accounts: validAccounts
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