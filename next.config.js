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
        REVOLUT_ACCESS_TOKEN: 'oa_prod_to1b_yH0FIhGqIJZP61FFIrM2DyDZZEcpumMkmRrQOc',
        REVOLUT_REFRESH_TOKEN: 'oa_prod_h6mr-yD-gWWZyphmUQ5Ksonjs0TfQrnQdn7J9ZadSZ0',
        REVOLUT_TOKEN_EXPIRES: '1737054779447',
        REVOLUT_SCOPES: 'account:read account:write cards:read cards:write'
    }
}; 