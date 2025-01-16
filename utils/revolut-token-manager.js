import axios from 'axios';
import { generateJWT } from './revolut-auth';

class TokenManager {
    constructor() {
        this.tokens = {
            access_token: process.env.REVOLUT_ACCESS_TOKEN || null,
            refresh_token: process.env.REVOLUT_REFRESH_TOKEN || null,
            expires_at: process.env.REVOLUT_TOKEN_EXPIRES || null
        };
    }

    setTokens(accessToken, refreshToken, expiresIn) {
        this.tokens = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Date.now() + (expiresIn * 1000)
        };
        
        // Log tokens for manual addition to Vercel environment
        console.log('New tokens generated:', {
            REVOLUT_ACCESS_TOKEN: accessToken,
            REVOLUT_REFRESH_TOKEN: refreshToken,
            REVOLUT_TOKEN_EXPIRES: this.tokens.expires_at
        });
    }

    async getValidToken() {
        if (!this.tokens.access_token) {
            throw new Error('No tokens available');
        }

        // Check if token is expired or about to expire (within 5 minutes)
        if (Date.now() >= this.tokens.expires_at - 300000) {
            await this.refreshToken();
        }

        return this.tokens.access_token;
    }

    async refreshToken() {
        try {
            const token = generateJWT();
            const formData = new URLSearchParams();
            formData.append('grant_type', 'refresh_token');
            formData.append('refresh_token', this.tokens.refresh_token);
            formData.append('client_id', process.env.REVOLUT_CLIENT_ID);
            formData.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
            formData.append('client_assertion', token);

            const response = await axios.post(
                'https://b2b.revolut.com/api/1.0/auth/token',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.setTokens(
                response.data.access_token,
                response.data.refresh_token,
                response.data.expires_in
            );

            return this.tokens.access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
}

// Create singleton instance
const tokenManager = new TokenManager();
export default tokenManager; 