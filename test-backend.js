// Test script to verify backend connectivity
const http = require('http');

const testEndpoint = (path, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ ${path}: ${res.statusCode} - ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${path}: ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Test endpoints
const runTests = async () => {
  console.log('🧪 Testing Backend Endpoints...\n');
  
  try {
    await testEndpoint('/api/test');
    console.log('✅ Basic API test passed!');
  } catch (err) {
    console.log('❌ Basic API test failed:', err.message);
  }
  
  try {
    await testEndpoint('/api/health');
    console.log('✅ Backend health check passed!');
  } catch (err) {
    console.log('❌ Backend health check failed:', err.message);
  }
  
  console.log('\n🧪 Testing complete!');
};

runTests();
