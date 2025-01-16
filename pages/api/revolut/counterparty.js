import { createRevolutClient } from '../../../utils/revolut-client';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { 
                name, 
                email, 
                country, 
                currency,
                accountNo,
                sortCode,
                routingNumber,
                iban
            } = req.body;

            if (!name || !email || !country) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['name', 'email', 'country']
                });
            }

            const client = createRevolutClient();
            const response = await client.post('/counterparties', {
                profile_type: 'personal',
                name: name,
                email: email,
                country: country,
                currency: currency,
                ...(accountNo && { account_no: accountNo }),
                ...(sortCode && { sort_code: sortCode }),
                ...(routingNumber && { routing_number: routingNumber }),
                ...(iban && { iban: iban })
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Counterparty creation error:', error.response?.data || error);
            res.status(error.response?.status || 500).json({
                error: error.response?.data || 'Internal server error'
            });
        }
    } else if (req.method === 'GET') {
        try {
            const client = createRevolutClient();
            const response = await client.get('/counterparties');
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Counterparty fetch error:', error.response?.data || error);
            res.status(error.response?.status || 500).json({
                error: error.response?.data || 'Internal server error'
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
} 