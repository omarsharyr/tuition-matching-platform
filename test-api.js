// Test script to check API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test login with a sample user
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', response.data);
    return response.data.token;
    
  } catch (error) {
    console.error('Login failed:', error?.response?.data || error.message);
    return null;
  }
}

async function testDashboard(token, role) {
  try {
    console.log(`Testing ${role} dashboard endpoint...`);
    
    const response = await axios.get(`${BASE_URL}/${role}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`${role} dashboard stats:`, response.data);
    
  } catch (error) {
    console.error(`${role} dashboard failed:`, error?.response?.data || error.message);
    console.error('Status:', error?.response?.status);
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server not responding or health endpoint missing');
  }
  
  console.log('\n--- Testing Authentication ---');
  const token = await testLogin();
  
  if (token) {
    console.log('\n--- Testing Dashboard Endpoints ---');
    await testDashboard(token, 'student');
    await testDashboard(token, 'tutor');
  }
}

runTests().catch(console.error);
