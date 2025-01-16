export default function Home() {
    return (
        <div>
            <h1>Revolut API Integration</h1>
            <p>Processing OAuth callback...</p>
            <script dangerouslySetInnerHTML={{
                __html: `
                    const urlParams = new URLSearchParams(window.location.search);
                    const code = urlParams.get('code');
                    if (code) {
                        window.location.href = '/api/revolut/oauth/callback?code=' + code;
                    }
                `
            }} />
        </div>
    );
} 