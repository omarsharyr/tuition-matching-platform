import axios from 'axios';

async function testServer() {
  try {
    console.log('Testing server connection...');
    
    // Test basic server connectivity
    const response = await axios.get('http://localhost:5000/', {
      timeout: 5000
    });
    
    console.log('✅ Server is running!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('❌ Server test failed:');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running on port 5000');
    }
  }
  
  // Test if we can access job posts endpoint
  try {
    console.log('\nTesting job posts endpoint...');
    const response = await axios.get('http://localhost:5000/api/tutor/jobs', {
      timeout: 5000
    });
    console.log('✅ Job posts endpoint accessible');
    console.log('Posts found:', response.data?.length || 0);
  } catch (error) {
    console.log('Job posts endpoint error:', error.response?.status || error.message);
  }
}

testServer();
