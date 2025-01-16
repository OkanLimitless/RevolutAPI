module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                has: [
                    {
                        type: 'query',
                        key: 'code'
                    }
                ],
                destination: '/api/revolut/oauth/callback',
                permanent: false
            }
        ];
    },
    env: {
        REVOLUT_REDIRECT_URI: 'https://api.diamondskymarketing.nl/api/revolut/oauth/callback',
        REVOLUT_KEY_SIZE: 2048,
        REVOLUT_CLIENT_ID: 'vdt7F3GzdffAZ_EWW9VFjZtLC-qOttZpcVgB-RZISiE',
        REVOLUT_ACCESS_TOKEN: process.env.REVOLUT_ACCESS_TOKEN,
        REVOLUT_REFRESH_TOKEN: process.env.REVOLUT_REFRESH_TOKEN,
        REVOLUT_TOKEN_EXPIRES: process.env.REVOLUT_TOKEN_EXPIRES,
        REVOLUT_SCOPES: 'read write cards:write cards:read'
    }
}; 