// Simple test script for API endpoints
import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('Testing login...');
  
  // Test login
  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const loginResult = await makeRequest(loginOptions, {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    
    console.log('Login status:', loginResult.status);
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('✅ Login successful');
      
      // Test dashboard
      console.log('Testing dashboard...');
      const dashboardOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/student/dashboard/stats',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      };
      
      const dashboardResult = await makeRequest(dashboardOptions);
      console.log('Dashboard status:', dashboardResult.status);
      console.log('Dashboard data:', dashboardResult.data);
      
      if (dashboardResult.status === 200) {
        console.log('✅ Dashboard API working!');
      } else {
        console.log('❌ Dashboard API failed:', dashboardResult.data);
      }
    } else {
      console.log('❌ Login failed:', loginResult.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
