const { exec } = require('child_process');
const fs = require('fs');

// Create certs directory if it doesn't exist
if (!fs.existsSync('certs')) {
    fs.mkdirSync('certs');
}

// Generate private key and certificate with shorter key length (1024 bits)
const opensslCommands = [
    // Generate private key with shorter length
    `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out certs/private.key`,
    
    // Generate certificate signing request
    `openssl req -new -key certs/private.key -out certs/request.csr -subj "/emailAddress=info@diamondskymarketing.nl/C=NL/ST=Gelderland/L=Varsseveld/O=Diamond Sky Marketing/OU=Development/CN=api.diamondskymarketing.nl"`,
    
    // Generate self-signed certificate with shorter validity
    `openssl x509 -req -days 365 -in certs/request.csr -signkey certs/private.key -out certs/public.cer`,
    
    // Convert private key to PKCS8 format
    `openssl pkcs8 -topk8 -inform PEM -in certs/private.key -out certs/private.pkcs8.key -nocrypt`
];

// Execute commands sequentially
const executeCommands = async (commands) => {
    for (const command of commands) {
        try {
            await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) reject(error);
                    else resolve(stdout);
                });
            });
        } catch (error) {
            console.error(`Error executing command: ${command}`);
            console.error(error);
            return;
        }
    }

    // Read and format keys for .env file
    const privateKey = fs.readFileSync('certs/private.pkcs8.key', 'utf8');
    const publicCert = fs.readFileSync('certs/public.cer', 'utf8');

    // Format the keys with actual newlines for the environment variable
    const formattedPrivateKey = privateKey.trim();
    const formattedPublicCert = publicCert.trim();

    // Display lengths for verification
    console.log('\nKey lengths:');
    console.log('Private key length:', formattedPrivateKey.length);
    console.log('Public cert length:', formattedPublicCert.length);

    // Create .env content
    const envContent = `# Revolut API Credentials
REVOLUT_CLIENT_ID=${process.env.REVOLUT_CLIENT_ID || 'pu13ThXTjCMLI5MNB3JIbbsw5Utj6GA-xbihViXpS1I'}
REVOLUT_ISSUER=diamondskymarketing.nl
REVOLUT_API_ENVIRONMENT=production
REVOLUT_REDIRECT_URI=https://api.diamondskymarketing.nl/api/revolut/oauth/callback

# Certificate contents
REVOLUT_PRIVATE_KEY='${formattedPrivateKey}'
REVOLUT_PUBLIC_CERT='${formattedPublicCert}'
`;

    // Write to .env file
    fs.writeFileSync('.env', envContent);
    console.log('\nCreated .env file with formatted certificates');

    // Also display the certificates for manual copying if needed
    console.log('\nPrivate Key:');
    console.log(formattedPrivateKey);
    console.log('\nPublic Certificate:');
    console.log(formattedPublicCert);

    // Clean up temporary files
    fs.unlinkSync('certs/request.csr');
};

executeCommands(opensslCommands); 