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
        REVOLUT_ACCESS_TOKEN: 'oa_prod_knWZ4V5XROFACtV-P2xGzIFuPU58qoCZVXpguuSjQp0',
        REVOLUT_REFRESH_TOKEN: 'oa_prod_uJqHttLfAHfZKsAbOzRAGYqx3Lfo3OY5AJZMU7-mQLQ',
        REVOLUT_TOKEN_EXPIRES: '1737059823106',
        REVOLUT_SCOPES: 'READ,WRITE,PAY'
    }
}; 