import axios from 'axios';
import { generateJWT } from '../../../utils/revolut-auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Generate JWT token
        const token = generateJWT();
        console.log('Generated token length:', token.length);

        // Configure axios for Revolut API
        const revolutClient = axios.create({
            baseURL: 'https://b2b.revolut.com/api/1.0',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log('Making request to Revolut API...');
        // Get accounts information
        const response = await revolutClient.get('/accounts');
        console.log('Response received:', response.status);
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Full error:', error);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal server error',
            message: error.message,
            details: error.response?.data
        });
    }
} 