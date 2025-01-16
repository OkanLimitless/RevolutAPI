import jwt from 'jsonwebtoken';

export function generateJWT() {
    try {
        const now = Math.floor(Date.now() / 1000);
        const jti = `jwt_${Date.now()}`;
        
        const payload = {
            iss: 'api.diamondskymarketing.nl',
            sub: process.env.REVOLUT_CLIENT_ID,
            aud: ['https://revolut.com', 'https://b2b.revolut.com/api/2.0'],
            exp: now + 60 * 5,
            iat: now,
            jti,
            scope: 'READ,WRITE'
        };

        const privateKey = process.env.REVOLUT_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/^'/, '')
            .replace(/'$/, '')
            .trim();

        const token = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            header: {
                alg: 'RS256',
                typ: 'JWT',
                kid: process.env.REVOLUT_CLIENT_ID
            }
        });

        return token;
    } catch (error) {
        console.error('JWT Generation Error:', error);
        throw error;
    }
} 