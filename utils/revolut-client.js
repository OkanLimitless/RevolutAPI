import axios from 'axios';
import tokenManager from './revolut-token-manager';

export async function createRevolutClient() {
    const token = await tokenManager.getValidToken();
    
    const client = axios.create({
        baseURL: 'https://b2b.revolut.com/api/2.0',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Diamond Sky Marketing API',
            'Api-Version': '2023-10-15'
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
                data: error.response?.data,
                headers: error.config?.headers
            });
            return Promise.reject(error);
        }
    );

    return client;
} 