// Test admin dashboard pending users functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugAdminDashboardPendingUsers() {
  console.log('🖥️ Debugging Admin Dashboard - Pending Users Issue...\n');

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

    // Step 2: Test dashboard stats endpoint
    console.log('\n📊 Testing /admin/dashboard/stats...');
    try {
      const statsResponse = await api.get('/admin/dashboard/stats');
      console.log('✅ Dashboard stats retrieved:');
      const stats = statsResponse.data;
      console.log(`   📈 Total Users: ${stats.totalUsers || 0}`);
      console.log(`   🎓 Students: ${stats.totalStudents || 0}`);
      console.log(`   👨‍🏫 Tutors: ${stats.totalTutors || 0}`);
      console.log(`   ✅ Verified Users: ${stats.verifiedUsers || 0}`);
      console.log(`   ⏳ Pending Verification: ${stats.pendingVerification || 0}`);
    } catch (error) {
      console.log('❌ Dashboard stats failed:', error.response?.data?.message || error.message);
    }

    // Step 3: Test verification queue endpoint (the key one!)
    console.log('\n🔍 Testing /admin/verification-queue...');
    try {
      const queueResponse = await api.get('/admin/verification-queue');
      const queueData = queueResponse.data;
      
      console.log('✅ Verification queue retrieved:');
      console.log(`   📊 Total pending users: ${Array.isArray(queueData) ? queueData.length : 'Not an array'}`);
      
      if (Array.isArray(queueData) && queueData.length > 0) {
        console.log('   📋 Pending users details:');
        queueData.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.name || 'N/A'} (${user.email}) - Role: ${user.role} - Status: ${user.accountStatus || 'N/A'}`);
          if (user.documents && user.documents.length > 0) {
            console.log(`         📎 Documents: ${user.documents.length} uploaded`);
          } else {
            console.log(`         📎 No documents uploaded`);
          }
        });
        
        // Filter by role for dashboard display
        const tutors = queueData.filter(user => user.role === 'tutor');
        const students = queueData.filter(user => user.role === 'student');
        
        console.log(`\n   👨‍🏫 Tutors awaiting verification: ${tutors.length}`);
        console.log(`   🎓 Students awaiting verification: ${students.length}`);
        
        console.log('\n🎯 Dashboard should display:');
        console.log(`   - Recent Activity showing "${tutors.length} tutors awaiting verification"`);
        console.log(`   - Recent Activity showing "${students.length} students awaiting verification"`);
        
      } else if (Array.isArray(queueData) && queueData.length === 0) {
        console.log('   ℹ️  No users currently pending verification');
        console.log('   🎯 Dashboard should show "All verifications up to date"');
      } else {
        console.log('   ❌ Invalid response format - not an array!');
        console.log('   📄 Response:', JSON.stringify(queueData, null, 2));
      }
    } catch (error) {
      console.log('❌ Verification queue failed:', error.response?.data?.message || error.message);
      console.log('   Status code:', error.response?.status);
      
      // This might be the issue - endpoint doesn't exist or has different path
      console.log('\n💡 Possible issues:');
      console.log('   1. The /admin/verification-queue endpoint might not exist');
      console.log('   2. The endpoint might return different data structure');
      console.log('   3. The endpoint might require different authentication');
    }

    // Step 4: Check what endpoints are actually available
    console.log('\n🔍 Let me check what admin endpoints are available...');
    
    // Try alternative endpoints that might exist
    const endpointsToTry = [
      '/admin/users',
      '/admin/pending-users', 
      '/admin/verify-queue',
      '/admin/verification',
      '/admin/users/pending'
    ];
    
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`   🔍 Trying ${endpoint}...`);
        const response = await api.get(endpoint);
        console.log(`   ✅ ${endpoint} works! Response type:`, typeof response.data);
        if (Array.isArray(response.data)) {
          console.log(`      📊 Contains ${response.data.length} items`);
        } else if (response.data && typeof response.data === 'object') {
          console.log(`      📊 Object keys:`, Object.keys(response.data));
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint} failed:`, error.response?.status || error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Admin dashboard debug failed:', error.response?.data?.message || error.message);
  }
}

debugAdminDashboardPendingUsers();
