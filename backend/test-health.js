import axios from 'axios';

async function testAPI() {
  try {
    console.log('🔍 Testing API Health...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test test endpoint  
    const testResponse = await axios.get('http://localhost:5000/api/test');
    console.log('✅ Test endpoint passed:', testResponse.data);
    
  } catch (error) {
    console.log('❌ API Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - server not running');
    } else if (error.response) {
      console.log('❌ Server responded with error:', error.response.status);
    }
  }
}

testAPI();
