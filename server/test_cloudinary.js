import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Load env vars
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('--- Cloudinary Config Check ---');
console.log(`Cloud Name: ${cloudName ? 'OK (' + cloudName + ')' : 'MISSING'}`);
console.log(`API Key:    ${apiKey ? 'OK' : 'MISSING'}`);
console.log(`API Secret: ${apiSecret ? 'OK' : 'MISSING'}`);

if (!cloudName || !apiKey || !apiSecret) {
    console.error('\n❌ Error: Missing Cloudinary credentials in .env file.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

console.log('\n--- Testing Connection ---');
cloudinary.api.ping()
    .then(res => {
        console.log('✅ Connection Successful!');
        console.log('Response:', res);
    })
    .catch(err => {
        console.error('❌ Connection Failed!');
        console.error('Error:', err.message);
        if (err.http_code === 401) {
            console.error('Hint: Check if your API Key and Secret are correct.');
        }
    });
