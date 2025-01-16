import axios from 'axios';
import tokenManager from './revolut-token-manager';

export async function createRevolutClient() {
    const token = await tokenManager.getValidToken();
    
    const client = axios.create({
        baseURL: 'https://b2b.revolut.com/api/1.0',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // Add response interceptor for debugging
    client.interceptors.response.use(
        response => response,
        error => {
            console.error('API Request failed:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data
            });
            return Promise.reject(error);
        }
    );

    return client;
} 