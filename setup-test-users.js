// Simple test to check admin login and create test users for verification
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function setupTestUsers() {
  console.log('🧪 Setting up test users for verification queue...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Test basic connectivity
    console.log('🌐 Testing server connectivity...');
    try {
      const healthCheck = await axios.get('http://localhost:5000');
      console.log('✅ Server is responding');
    } catch (healthError) {
      console.log('❌ Server connectivity issue:', healthError.message);
      return;
    }

    // Step 2: Try admin login
    console.log('\n👨‍💼 Testing admin login...');
    try {
      const adminLogin = await api.post('/auth/login', {
        email: 'admin@tuition.local',
        password: 'Admin123!'
      });
      console.log('✅ Admin login successful');
      
      const adminToken = adminLogin.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      
      // Test verification queue immediately
      console.log('\n📋 Testing verification queue...');
      const queueResponse = await api.get('/admin/verification-queue');
      console.log('✅ Verification queue API works!');
      console.log(`📊 Found ${queueResponse.data.length} users in queue`);
      
      if (queueResponse.data.length > 0) {
        console.log('\n👥 Users in verification queue:');
        queueResponse.data.forEach((user, i) => {
          console.log(`${i+1}. ${user.name} (${user.email}) - ${user.role} - ${user.verificationStatus}`);
        });
      }
      
    } catch (adminError) {
      console.log('❌ Admin login failed:', adminError.response?.data?.message || adminError.message);
      console.log('Status:', adminError.response?.status);
    }

    // Step 3: Create test users for verification (if queue is empty)
    console.log('\n👤 Creating test users for verification...');
    
    const testUsers = [
      {
        name: 'Test Tutor 1',
        email: 'testtutor1@example.com',
        password: '123456',
        role: 'tutor',
        phone: '01700000001',
        subjects: ['Mathematics', 'Physics'],
        location: 'Dhaka'
      },
      {
        name: 'Test Student 1',
        email: 'teststudent1@example.com',
        password: '123456',
        role: 'student',
        phone: '01700000002',
        grade: '10',
        location: 'Dhaka'
      }
    ];

    for (const userData of testUsers) {
      try {
        // Use new API instance without admin token for registration
        const publicApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await publicApi.post('/auth/register', userData);
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      } catch (createError) {
        if (createError.response?.status === 400 && createError.response?.data?.message?.includes('already exists')) {
          console.log(`ℹ️  ${userData.role} ${userData.email} already exists`);
        } else {
          console.log(`❌ Failed to create ${userData.email}:`, createError.response?.data?.message || createError.message);
        }
      }
    }

    // Step 4: Check verification queue again
    console.log('\n🔍 Checking verification queue after creating test users...');
    try {
      const finalQueueResponse = await api.get('/admin/verification-queue');
      console.log(`✅ Final queue length: ${finalQueueResponse.data.length}`);
      
      if (finalQueueResponse.data.length > 0) {
        console.log('\n📋 Users now in verification queue:');
        const tutors = finalQueueResponse.data.filter(u => u.role === 'tutor');
        const students = finalQueueResponse.data.filter(u => u.role === 'student');
        
        console.log(`👨‍🏫 Tutors: ${tutors.length}`);
        tutors.forEach(tutor => {
          console.log(`   - ${tutor.name} (${tutor.email})`);
        });
        
        console.log(`🎓 Students: ${students.length}`);
        students.forEach(student => {
          console.log(`   - ${student.name} (${student.email})`);
        });
        
        console.log('\n🎯 Admin dashboard should now show:');
        console.log(`   - ${tutors.length} tutor(s) awaiting verification`);
        console.log(`   - ${students.length} student(s) awaiting verification`);
        console.log('   - Red urgent notification section');
        console.log('   - Auto-refresh every 30 seconds');
      } else {
        console.log('📭 Verification queue is still empty');
      }
      
    } catch (queueError) {
      console.log('❌ Final queue check failed:', queueError.response?.data?.message || queueError.message);
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

setupTestUsers();
