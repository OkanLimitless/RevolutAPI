import fs from 'fs';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const privateKey = process.env.REVOLUT_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/^'/, '')
            .replace(/'$/, '')
            .trim();

        const publicCert = process.env.REVOLUT_PUBLIC_CERT
            .replace(/\\n/g, '\n')
            .replace(/^'/, '')
            .replace(/'$/, '')
            .trim();

        // Verify the key pair matches
        const testData = 'test-data';
        const sign = crypto.createSign('SHA256');
        sign.update(testData);
        const signature = sign.sign(privateKey, 'base64');

        const verify = crypto.createVerify('SHA256');
        verify.update(testData);
        const isValid = verify.verify(publicCert, signature, 'base64');

        res.status(200).json({
            keyPairValid: isValid,
            privateKey: {
                format: privateKey.split('\n')[0],
                length: privateKey.length,
                lines: privateKey.split('\n').length
            },
            publicCert: {
                format: publicCert.split('\n')[0],
                length: publicCert.length,
                lines: publicCert.split('\n').length
            }
        });
    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({
            error: 'Certificate verification failed',
            message: error.message
        });
    }
} 