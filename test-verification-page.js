// Test AdminVerification page functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminVerificationPage() {
  console.log('🔍 Testing AdminVerification Page APIs...\n');

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

    const adminToken = adminLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    console.log('✅ Admin logged in successfully');

    // Step 2: Test the exact same endpoint that AdminVerification.jsx uses
    console.log('\n🔍 Testing /admin/verification-queue (AdminVerification component endpoint)...');
    try {
      const response = await api.get('/admin/verification-queue');
      const queue = response.data;
      
      console.log('✅ AdminVerification endpoint works!');
      console.log(`📊 Raw response length: ${Array.isArray(queue) ? queue.length : 'Not array'}`);
      
      if (Array.isArray(queue)) {
        console.log(`📋 Users in queue: ${queue.length}`);
        
        if (queue.length > 0) {
          console.log('\n👥 Users waiting for verification:');
          queue.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name || 'N/A'} (${user.email})`);
            console.log(`      Role: ${user.role}`);
            console.log(`      Status: ${user.accountStatus || 'N/A'}`);
            console.log(`      Documents: ${user.documents ? user.documents.length : 0}`);
            console.log(`      Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
            console.log('');
          });
          
          console.log('🎯 AdminVerification page should show:');
          console.log(`   - Left sidebar with ${queue.length} users listed`);
          console.log(`   - Right panel with first user's details`);
          console.log(`   - Document viewer with uploaded files`);
          console.log(`   - Approve/Reject buttons`);
          
        } else {
          console.log('📭 No users in verification queue');
          console.log('🎯 AdminVerification page should show:');
          console.log('   - Empty state message');
          console.log('   - "No pending verifications" text');
        }
        
        // Test the processing after selection is made
        if (queue.length > 0) {
          const testUser = queue[0];
          console.log(`\n🧪 Testing user selection functionality with: ${testUser.name} (${testUser.email})`);
          
          // This is what happens when user clicks on a user in the list
          console.log('📄 User details that should display:');
          console.log(`   Name: ${testUser.name}`);
          console.log(`   Email: ${testUser.email}`);
          console.log(`   Role: ${testUser.role}`);
          console.log(`   Phone: ${testUser.phone || 'N/A'}`);
          console.log(`   Location: ${testUser.location || 'N/A'}`);
          console.log(`   Subjects: ${testUser.subjects ? testUser.subjects.join(', ') : 'N/A'}`);
          
          if (testUser.documents && testUser.documents.length > 0) {
            console.log(`   📎 Documents (${testUser.documents.length}):`);
            testUser.documents.forEach((doc, index) => {
              console.log(`      ${index + 1}. ${doc.name} (${doc.type})`);
            });
          } else {
            console.log('   📎 No documents uploaded');
          }
        }
        
      } else {
        console.log('❌ Invalid response format!');
        console.log('Response:', queue);
      }
      
    } catch (error) {
      console.log('❌ AdminVerification endpoint failed:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
      
      if (error.response?.status === 404) {
        console.log('\n💡 Possible issues:');
        console.log('   - Backend route /admin/verification-queue not defined');
        console.log('   - Route handler not properly implemented');
        console.log('   - Server not running on port 5000');
      }
    }

    // Step 3: Test if frontend can reach the backend
    console.log('\n🌐 Testing if frontend (localhost:3000) can reach backend (localhost:5000)...');
    
    // Simulate what the browser would do
    try {
      const healthCheck = await api.get('/auth/health');
      console.log('✅ Backend is reachable from this test script');
    } catch (healthError) {
      try {
        const basicCheck = await api.get('/');
        console.log('✅ Backend responds to basic requests');
      } catch (basicError) {
        console.log('❌ Backend might not be running or unreachable');
      }
    }

  } catch (error) {
    console.error('\n❌ AdminVerification test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - is the backend server running?');
      console.log('   Try: cd backend && node server.js');
    }
  }
}

testAdminVerificationPage();
