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
        REVOLUT_KEY_SIZE: 2048
    }
}; 