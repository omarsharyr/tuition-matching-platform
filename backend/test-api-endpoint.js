import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testStudentApplicationsAPI = async () => {
    try {
        // Generate a token for the student
        const token = jwt.sign(
            { id: '68baf97b3f42576f34896499', email: 'stu@gmail.com', role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        console.log('🔑 Testing API endpoint with token');

        const response = await fetch('http://localhost:5000/api/student/applications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log(`❌ API Error (${response.status}): ${errorText}`);
        }

    } catch (error) {
        console.error('❌ Request Error:', error.message);
    }
};

testStudentApplicationsAPI();
