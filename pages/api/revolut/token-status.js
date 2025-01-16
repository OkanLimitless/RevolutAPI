import tokenManager from '../../../utils/revolut-token-manager';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const status = {
            has_access_token: !!tokenManager.tokens.access_token,
            has_refresh_token: !!tokenManager.tokens.refresh_token,
            expires_at: tokenManager.tokens.expires_at,
            is_expired: tokenManager.tokens.expires_at ? Date.now() >= tokenManager.tokens.expires_at : null,
            environment: {
                access_token_set: !!process.env.REVOLUT_ACCESS_TOKEN,
                refresh_token_set: !!process.env.REVOLUT_REFRESH_TOKEN,
                expires_set: !!process.env.REVOLUT_TOKEN_EXPIRES
            }
        };

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            token_status: status
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to check token status',
            error: error.message
        });
    }
} 