// Simple login test
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing basic login...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });
    console.log('Login successful!');
    console.log('User:', response.data.user.name);
    console.log('Role:', response.data.user.role);
  } catch (error) {
    console.log('Login failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Server not running or not accessible on port 5000');
    }
  }
}

testLogin();
