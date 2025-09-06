// Test the admin verification queue frontend API directly
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendVerificationAPI() {
  console.log('🔍 Testing frontend verification queue API...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Login as admin
    console.log('👨‍💼 Logging in as admin...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tuition.local',
      password: 'Admin123!'
    });

    const token = adminLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Admin logged in successfully');

    // Step 2: Test verification queue endpoint (same as frontend uses)
    console.log('\n📋 Testing /admin/verification-queue endpoint...');
    const response = await api.get('/admin/verification-queue');
    
    console.log('✅ API Response received');
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Data type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    console.log(`📊 Queue length: ${response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('\n🔍 Queue data structure:');
      console.log(JSON.stringify(response.data[0], null, 2));
      
      console.log('\n📋 All users in queue:');
      response.data.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Status: ${user.verificationStatus}`);
        console.log(`      Documents: ${user.documents?.length || 0}`);
        console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('      ---');
      });
    } else {
      console.log('❌ No users in queue or empty response');
    }

    // Step 3: Test with role filter (like frontend might use)
    console.log('\n🎯 Testing with role filters...');
    
    const studentQueue = await api.get('/admin/verification-queue?role=student');
    console.log(`📊 Students only: ${studentQueue.data?.length || 0} users`);
    
    const tutorQueue = await api.get('/admin/verification-queue?role=tutor');
    console.log(`📊 Tutors only: ${tutorQueue.data?.length || 0} users`);

    // Step 4: Compare with regular users endpoint
    console.log('\n🔄 Comparing with /admin/users endpoint...');
    const allUsersResponse = await api.get('/admin/users');
    const allUsers = allUsersResponse.data?.users || allUsersResponse.data || [];
    
    const pendingUsers = allUsers.filter(user => user.verificationStatus === 'pending');
    console.log(`📊 All users: ${allUsers.length}`);
    console.log(`📊 Pending users (from /admin/users): ${pendingUsers.length}`);
    
    if (pendingUsers.length !== response.data?.length) {
      console.log('⚠️  MISMATCH: Different counts between endpoints!');
      console.log('   This suggests a data consistency issue');
    } else {
      console.log('✅ Counts match between endpoints');
    }

  } catch (error) {
    console.error('\n❌ API Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Headers:`, error.response.headers);
    }
  }
}

testFrontendVerificationAPI();
