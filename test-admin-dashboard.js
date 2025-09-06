// Test admin functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test admin login first
async function testAdminDashboard() {
  try {
    // First, let's check if we have an admin user or create one
    console.log('🔧 Testing admin dashboard functionality...');
    
    // Try to create admin user (this might fail if it exists, that's OK)
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created or already exists');
    } catch (e) {
      console.log('ℹ️ Admin user likely already exists');
    }

    // Login as admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Admin login successful');

    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test 1: Get all users (this was failing)
    console.log('\n📋 Testing /admin/users endpoint...');
    const usersResponse = await api.get('/admin/users');
    console.log('✅ Users endpoint response structure:', {
      hasUsers: Array.isArray(usersResponse.data?.users),
      userCount: usersResponse.data?.users?.length || 0,
      hasPagination: !!usersResponse.data?.pagination
    });

    // Test 2: Get verification queue
    console.log('\n📋 Testing /admin/verification-queue endpoint...');
    const queueResponse = await api.get('/admin/verification-queue');
    console.log('✅ Verification queue response:', {
      isArray: Array.isArray(queueResponse.data),
      queueLength: queueResponse.data?.length || 0,
      firstUser: queueResponse.data?.[0] ? {
        id: queueResponse.data[0]._id,
        name: queueResponse.data[0].name,
        role: queueResponse.data[0].role,
        status: queueResponse.data[0].verificationStatus,
        hasDocuments: !!queueResponse.data[0].documents
      } : null
    });

    // Test 3: Get dashboard stats
    console.log('\n📊 Testing /admin/dashboard/stats endpoint...');
    const statsResponse = await api.get('/admin/dashboard/stats');
    console.log('✅ Dashboard stats:', statsResponse.data);

    console.log('\n🎉 All admin endpoints are working correctly!');

  } catch (error) {
    console.error('\n❌ ERROR occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
  }
}

testAdminDashboard();
