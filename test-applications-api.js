// Use node-fetch since it's more universally available
const fetch = require('node:https');

async function testApplicationsAPI() {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('Testing Application APIs...\n');

    try {
        // First login as a student
        console.log('1. Logging in as student...');
        const studentResponse = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'student1@example.com',
                password: 'password123'
            })
        });
        
        const studentToken = studentLogin.data.token;
        console.log('✅ Student logged in');

        // Test student applications endpoint
        console.log('\n2. Testing /student/applications endpoint...');
        const studentApps = await axios.get(`${baseURL}/student/applications`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        
        console.log('Response status:', studentApps.status);
        console.log('Response data structure:');
        console.log('Type:', typeof studentApps.data);
        console.log('Is Array:', Array.isArray(studentApps.data));
        if (studentApps.data && typeof studentApps.data === 'object') {
            console.log('Keys:', Object.keys(studentApps.data));
        }
        console.log('Sample data:', JSON.stringify(studentApps.data, null, 2));

        // Login as tutor
        console.log('\n3. Logging in as tutor...');
        const tutorLogin = await axios.post(`${baseURL}/auth/login`, {
            email: 'tutor1@example.com', 
            password: 'password123'
        });
        
        const tutorToken = tutorLogin.data.token;
        console.log('✅ Tutor logged in');

        // Test tutor applications endpoint
        console.log('\n4. Testing /tutor/applications endpoint...');
        const tutorApps = await axios.get(`${baseURL}/tutor/applications`, {
            headers: { Authorization: `Bearer ${tutorToken}` }
        });
        
        console.log('Response status:', tutorApps.status);
        console.log('Response data structure:');
        console.log('Type:', typeof tutorApps.data);
        console.log('Is Array:', Array.isArray(tutorApps.data));
        if (tutorApps.data && typeof tutorApps.data === 'object') {
            console.log('Keys:', Object.keys(tutorApps.data));
        }
        console.log('Sample data:', JSON.stringify(tutorApps.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testApplicationsAPI();
