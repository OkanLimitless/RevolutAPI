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
        REVOLUT_ACCESS_TOKEN: 'oa_prod_nUiDq8rNgPjSw3lVyD1NObdLVjTgbSFUCkag7D8FQpE',
        REVOLUT_REFRESH_TOKEN: 'oa_prod_vbD568x-AvJWTTa1BNdM3Irqsq0O4GLo90Zh7jtzTHI',
        REVOLUT_TOKEN_EXPIRES: '1737057193703',
        REVOLUT_SCOPES: 'READ,WRITE,PAY'
    }
}; 