import { generateJWT } from '../../../utils/revolut-auth';
import tokenManager from '../../../utils/revolut-token-manager';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Step 1: Test environment variables
        const envCheck = {
            client_id: !!process.env.REVOLUT_CLIENT_ID,
            issuer: !!process.env.REVOLUT_ISSUER,
            private_key: !!process.env.REVOLUT_PRIVATE_KEY,
            client_id_value: process.env.REVOLUT_CLIENT_ID,
            issuer_value: process.env.REVOLUT_ISSUER
        };

        // Step 2: Test JWT generation
        let jwt = null;
        let jwtError = null;
        try {
            jwt = generateJWT();
        } catch (error) {
            jwtError = error.message;
        }

        // Step 3: Test token manager state
        const tokenState = {
            has_access_token: !!tokenManager.tokens.access_token,
            has_refresh_token: !!tokenManager.tokens.refresh_token,
            expires_at: tokenManager.tokens.expires_at,
            is_expired: tokenManager.tokens.expires_at ? Date.now() >= tokenManager.tokens.expires_at : null
        };

        // Step 4: Generate OAuth URL for authorization
        const authUrl = `https://business.revolut.com/app-confirm?` +
            `client_id=${process.env.REVOLUT_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(process.env.REVOLUT_REDIRECT_URI)}` +
            `&response_type=code` +
            `&scope=read write cards:write cards:read`;

        // Return all test results
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            tests: {
                environment: envCheck,
                jwt: {
                    generated: !!jwt,
                    error: jwtError,
                    preview: jwt ? `${jwt.substring(0, 50)}...` : null
                },
                token_manager: tokenState
            },
            auth_required: !tokenState.has_access_token,
            auth_url: !tokenState.has_access_token ? authUrl : null,
            next_steps: !tokenState.has_access_token ? [
                "1. Visit the auth_url in your browser",
                "2. Authorize the application in Revolut",
                "3. You'll be redirected back to the callback URL",
                "4. The callback will automatically store the tokens",
                "5. Then you can use the balance and other API endpoints"
            ] : [
                "Tokens are present - you can now use the API endpoints"
            ]
        });

    } catch (error) {
        console.error('Test connection error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Connection test failed',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
} 