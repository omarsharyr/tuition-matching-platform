// Test script to check verification queue behavior
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testVerificationQueue() {
  console.log('🔍 Testing verification queue behavior...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Login as admin to check current queue
    console.log('👨‍💼 Logging in as admin...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tuition.local',
      password: 'Admin123!'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${adminLogin.data.token}`;
    console.log('✅ Admin logged in successfully');

    // Step 2: Check current verification queue
    console.log('\n📋 Checking current verification queue...');
    const queueResponse = await api.get('/admin/verification-queue');
    const queue = queueResponse.data || [];
    console.log(`📊 Current queue length: ${queue.length}`);
    
    if (queue.length > 0) {
      console.log('\n🔍 Users in queue:');
      queue.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Status: ${user.verificationStatus}`);
        console.log(`      Documents: ${user.documents?.length || 0} uploaded`);
        console.log(`      Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('      ---');
      });
    } else {
      console.log('   📂 Queue is empty - no pending users');
    }

    // Step 3: Check all users and their verification status
    console.log('\n👥 Checking all users in system...');
    const usersResponse = await api.get('/admin/users');
    const users = usersResponse.data?.users || usersResponse.data || [];
    console.log(`📊 Total users in system: ${users.length}`);

    const statusCounts = { verified: 0, pending: 0, rejected: 0 };
    console.log('\n📋 User verification statuses:');
    users.forEach((user) => {
      const status = user.verificationStatus || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      console.log(`   • ${user.name} (${user.email}) - ${user.role} - ${status}`);
    });

    console.log('\n📊 Status Summary:');
    Object.keys(statusCounts).forEach(status => {
      console.log(`   ${status}: ${statusCounts[status]} users`);
    });

    // Step 4: Test environment check
    console.log('\n🌍 Environment Information:');
    try {
      const healthResponse = await api.get('/health');
      console.log('   Backend status: Running');
    } catch (e) {
      console.log('   Backend status: Error -', e.message);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log('   💡 Hint: Admin credentials might be incorrect');
    }
  }
}

testVerificationQueue();
