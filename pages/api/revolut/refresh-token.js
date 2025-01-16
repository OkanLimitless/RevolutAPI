import tokenManager from '../../../utils/revolut-token-manager';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await tokenManager.refreshToken();
        
        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            timestamp: new Date().toISOString(),
            token_status: {
                has_access_token: !!tokenManager.tokens.access_token,
                has_refresh_token: !!tokenManager.tokens.refresh_token,
                expires_at: tokenManager.tokens.expires_at,
                is_expired: Date.now() >= tokenManager.tokens.expires_at
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to refresh token',
            error: error.message
        });
    }
} 