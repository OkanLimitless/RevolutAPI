import axios from 'axios';
import { generateJWT } from '../../../../utils/revolut-auth';
import tokenManager from '../../../../utils/revolut-token-manager';

export default async function handler(req, res) {
    if (!['GET', 'POST'].includes(req.method)) {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const code = req.query.code || req.body.code;
        const clientId = process.env.REVOLUT_CLIENT_ID;
        
        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }

        if (!clientId) {
            return res.status(400).json({ error: 'Client ID not configured' });
        }

        console.log('OAuth Debug:', {
            code,
            clientId,
            hasCode: !!code,
            hasClientId: !!clientId
        });

        // Generate JWT for token exchange
        const token = generateJWT();

        // Format according to Revolut's OAuth 2.0 specification
        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        formData.append('client_id', clientId);
        formData.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
        formData.append('client_assertion', token);

        console.log('Request parameters:', Object.fromEntries(formData));

        try {
            const response = await axios.post(
                'https://b2b.revolut.com/api/1.0/auth/token',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('Token exchange response:', response.data);
            
            if (response.data.access_token) {
                tokenManager.setTokens(
                    response.data.access_token,
                    response.data.refresh_token,
                    response.data.expires_in
                );
                console.log('Access token received and stored');
            }

            res.status(200).json({
                status: 'success',
                message: 'API activation successful',
                timestamp: new Date().toISOString(),
                details: response.data
            });
        } catch (error) {
            console.error('Token exchange error:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
                requestParams: Object.fromEntries(formData)
            });

            res.status(error.response?.status || 500).json({
                status: 'error',
                message: error.response?.data?.error_description || 'API activation failed',
                timestamp: new Date().toISOString(),
                details: error.response?.data,
                debug: {
                    clientId,
                    hasToken: !!token,
                    requestParams: Object.fromEntries(formData)
                }
            });
        }
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({
            status: 'error',
            message: 'OAuth callback failed',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
} 