import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        // Try different API endpoints to check access levels
        const checks = {
            accounts: null,
            cards: null,
            card_creation: null
        };

        try {
            // Check accounts access
            const accountsResponse = await client.get('/accounts');
            checks.accounts = {
                success: true,
                count: accountsResponse.data.length
            };
        } catch (error) {
            checks.accounts = {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }

        try {
            // Check cards access
            const cardsResponse = await client.get('/cards');
            checks.cards = {
                success: true,
                count: cardsResponse.data.length
            };
        } catch (error) {
            checks.cards = {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }

        try {
            // Try to get card creation limits
            const limitsResponse = await client.get('/cards/limits');
            checks.card_creation = {
                success: true,
                data: limitsResponse.data
            };
        } catch (error) {
            checks.card_creation = {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            access_checks: checks,
            token_info: {
                access_token_preview: client.defaults.headers['Authorization']?.substring(0, 20) + '...',
                has_cards_scope: client.defaults.headers['Authorization']?.includes('cards')
            }
        });

    } catch (error) {
        console.error('Access check error:', {
            error: error.response?.data || error,
            status: error.response?.status
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to check API access',
            error: error.response?.data?.message || error.message
        });
    }
} 