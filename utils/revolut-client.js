import axios from 'axios';
import tokenManager from './revolut-token-manager';

export async function createRevolutClient() {
    try {
        const token = await tokenManager.getValidToken();
        
        const client = axios.create({
            baseURL: 'https://b2b.revolut.com/api/1.0',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Add response interceptor for token refresh
        client.interceptors.response.use(
            response => response,
            async error => {
                if (error.response?.status === 401) {
                    try {
                        const newToken = await tokenManager.refreshToken();
                        error.config.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(error.config);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        throw refreshError;
                    }
                }
                throw error;
            }
        );

        return client;
    } catch (error) {
        console.error('Client creation error:', error);
        throw error;
    }
} 