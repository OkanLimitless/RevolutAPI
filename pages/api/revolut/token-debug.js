import tokenManager from '../../../utils/revolut-token-manager';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const now = Date.now();
        const tokenState = {
            access_token_exists: !!tokenManager.tokens.access_token,
            refresh_token_exists: !!tokenManager.tokens.refresh_token,
            access_token_preview: tokenManager.tokens.access_token?.substring(0, 20) + '...',
            refresh_token_preview: tokenManager.tokens.refresh_token?.substring(0, 20) + '...',
            expires_at: tokenManager.tokens.expires_at,
            current_time: now,
            is_expired: now >= tokenManager.tokens.expires_at,
            time_until_expiry: tokenManager.tokens.expires_at ? tokenManager.tokens.expires_at - now : null,
            environment: {
                client_id: process.env.REVOLUT_CLIENT_ID,
                scopes: process.env.REVOLUT_SCOPES
            }
        };

        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            token_state: tokenState
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Token debug failed',
            error: error.message
        });
    }
} 