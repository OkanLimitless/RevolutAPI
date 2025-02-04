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

        // Calculate total balance from all accounts
        let totalBalance = 0;
        for (const account of accounts) {
            try {
                const balanceResponse = await client.get(`/accounts/${account.id}`);
                if (account.currency === 'EUR') {
                    totalBalance += parseFloat(balanceResponse.data.balance);
                }
            } catch (error) {
                console.error(`Balance error for account ${account.id}:`, error);
            }
        }

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            accounts: [{
                id: 'total',
                name: 'Total Balance',
                currency: 'EUR',
                balance: totalBalance,
                monthlyGoal: 5000
            }]
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