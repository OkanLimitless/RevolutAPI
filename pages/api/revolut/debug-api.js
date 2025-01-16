import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Test various endpoints
        const tests = {
            accounts: null,
            cards: null,
            profiles: null
        };

        try {
            const accountsResponse = await client.get('/accounts');
            tests.accounts = {
                success: true,
                count: accountsResponse.data.length
            };
        } catch (error) {
            tests.accounts = {
                success: false,
                error: error.response?.data?.message
            };
        }

        try {
            const cardsResponse = await client.get('/card');
            tests.cards = {
                success: true,
                count: cardsResponse.data.length
            };
        } catch (error) {
            tests.cards = {
                success: false,
                error: error.response?.data?.message
            };
        }

        try {
            const profilesResponse = await client.get('/counterparties');
            tests.profiles = {
                success: true,
                data: profilesResponse.data
            };
        } catch (error) {
            tests.profiles = {
                success: false,
                error: error.response?.data?.message
            };
        }

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            api_version: '2.0',
            tests
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'API debug failed',
            error: error.message
        });
    }
} 