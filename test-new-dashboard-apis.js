const axios = require('axios');

async function testNewDashboardAPIs() {
  try {
    console.log('🧪 Testing New Dashboard API Endpoints...');
    
    // Login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test KPIs endpoint
    console.log('📊 Testing KPIs endpoint...');
    const kpisResponse = await axios.get('http://localhost:5000/api/student/kpis', { headers });
    console.log('KPIs:', kpisResponse.data);
    
    // Test Activity Feed endpoint
    console.log('📱 Testing Activity Feed endpoint...');
    const activityResponse = await axios.get('http://localhost:5000/api/student/activity?limit=10', { headers });
    console.log('Activity Feed:', activityResponse.data);
    
    // Test Recommendations endpoint
    console.log('💡 Testing Recommendations endpoint...');
    const recsResponse = await axios.get('http://localhost:5000/api/student/recommendations?limit=6', { headers });
    console.log('Recommendations:', recsResponse.data);
    
    console.log('✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testNewDashboardAPIs();
