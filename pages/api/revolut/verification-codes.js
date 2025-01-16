import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await createRevolutClient();
        
        const from = new Date();
        from.setDate(from.getDate() - 7);
        
        const params = {
            from: from.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
            count: 100
        };

        const response = await client.get('/transactions', { params });
        
        // Filter and format Google Ads verification transactions
        const verificationCodes = response.data
            .filter(tx => 
                tx.merchant?.name?.toLowerCase().includes('google') &&
                tx.type === 'card_payment' &&
                ['completed', 'declined', 'reverted', 'pending'].includes(tx.state) &&
                // Only include transactions that have a verification code pattern
                /[A-Za-z0-9]{3}\s[0-9]{6}/.test(tx.merchant.name)
            )
            .map(tx => {
                // Extract the verification code parts
                const fullCode = tx.merchant.name.replace('Google', '').trim();
                const [matchCode, verificationNumber] = fullCode.split(' ');
                
                return {
                    matchCode,              // e.g., "Hjz"
                    verificationNumber,     // e.g., "079352"
                    fullCode,              // e.g., "Hjz 079352"
                    amount: tx.amount,
                    currency: tx.currency,
                    state: tx.state,
                    created_at: tx.created_at,
                    completed_at: tx.completed_at || null
                };
            });

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            count: verificationCodes.length,
            verificationCodes: verificationCodes.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            )
        });

    } catch (error) {
        console.error('Verification codes fetch error:', {
            error: error.response?.data || error,
            status: error.response?.status,
            message: error.message
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch verification codes',
            timestamp: new Date().toISOString(),
            error: error.response?.data?.message || error.message
        });
    }
} 