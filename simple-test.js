// Simple test using native Node.js http
const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        
        req.on('error', reject);
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function testApis() {
    console.log('Testing APIs...\n');

    try {
        // Test login
        console.log('1. Testing student login...');
        const loginOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const loginData = JSON.stringify({
            email: 'stu@gmail.com',
            password: 'password123'
        });

        const loginResponse = await makeRequest(loginOptions, loginData);
        console.log('Login response:', loginResponse);
        
        if (loginResponse && loginResponse.token) {
            const token = loginResponse.token;
            console.log('✅ Got token:', token.substring(0, 20) + '...');

            // Test applications endpoint
            console.log('\n2. Testing /student/applications...');
            const appOptions = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/student/applications',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const appsResponse = await makeRequest(appOptions);
            console.log('Applications response:');
            console.log('Type:', typeof appsResponse);
            console.log('Is Array:', Array.isArray(appsResponse));
            if (typeof appsResponse === 'object' && appsResponse !== null) {
                console.log('Keys:', Object.keys(appsResponse));
            }
            console.log('Data:', JSON.stringify(appsResponse, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApis();
