// Test script to register a new user and verify they appear in queue
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:5000/api';

async function testNewUserRegistration() {
  console.log('🧪 Testing new user registration and verification queue...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Check queue before registration
    console.log('📋 Checking queue BEFORE registration...');
    
    // Login as admin first
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tuition.local',
      password: 'Admin123!'
    });
    
    const adminToken = adminLogin.data.token;
    const queueBefore = await api.get('/admin/verification-queue', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`   Queue size before: ${queueBefore.data?.length || 0}`);

    // Step 2: Register a new student
    console.log('\n👤 Registering new test student...');
    
    const timestamp = Date.now();
    const testUser = {
      name: `Test Student ${timestamp}`,
      email: `teststudent${timestamp}@example.com`,
      phone: '01700000001',
      password: 'password123',
      role: 'student',
      class: 'Grade 10',
      medium: 'English',
      currentSchool: 'Test School'
    };

    // Create mock files for registration (since student registration requires documents)
    const formData = new FormData();
    Object.keys(testUser).forEach(key => {
      formData.append(key, testUser[key]);
    });

    // Add mock documents (create temporary files)
    const mockDocContent = 'Mock document content for testing';
    const studentIdPath = `temp_student_id_${timestamp}.jpg`;
    const parentNidPath = `temp_parent_nid_${timestamp}.jpg`;
    const educationDocPath = `temp_education_${timestamp}.jpg`;
    
    fs.writeFileSync(studentIdPath, mockDocContent);
    fs.writeFileSync(parentNidPath, mockDocContent);
    fs.writeFileSync(educationDocPath, mockDocContent);

    formData.append('studentId', fs.createReadStream(studentIdPath));
    formData.append('parentNid', fs.createReadStream(parentNidPath));
    formData.append('educationDocument', fs.createReadStream(educationDocPath));

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: formData.getHeaders()
      });
      console.log('✅ Student registered successfully');
    } catch (regError) {
      console.log('❌ Registration failed:', regError.response?.data?.message || regError.message);
      
      // Clean up temp files
      try {
        fs.unlinkSync(studentIdPath);
        fs.unlinkSync(parentNidPath);
        fs.unlinkSync(educationDocPath);
      } catch (e) {}
      
      return;
    }

    // Clean up temp files
    try {
      fs.unlinkSync(studentIdPath);
      fs.unlinkSync(parentNidPath);
      fs.unlinkSync(educationDocPath);
    } catch (e) {}

    // Step 3: Check queue after registration
    console.log('\n📋 Checking queue AFTER registration...');
    
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const queueAfter = await api.get('/admin/verification-queue', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    const afterQueue = queueAfter.data || [];
    console.log(`   Queue size after: ${afterQueue.length}`);

    if (afterQueue.length > queueBefore.data?.length || 0) {
      console.log('✅ SUCCESS: New user appeared in verification queue!');
      
      // Find the new user
      const newUser = afterQueue.find(user => user.email === testUser.email);
      if (newUser) {
        console.log('\n🎯 New user details:');
        console.log(`   Name: ${newUser.name}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Role: ${newUser.role}`);
        console.log(`   Status: ${newUser.verificationStatus}`);
        console.log(`   Documents: ${newUser.documents?.length || 0} uploaded`);
        console.log(`   Created: ${new Date(newUser.createdAt).toLocaleString()}`);
      }
    } else {
      console.log('❌ ISSUE: New user did NOT appear in verification queue');
      console.log('   This could indicate the registration process is auto-verifying users');
    }

    // Step 4: List all users in the queue for verification
    console.log('\n📋 Complete verification queue:');
    afterQueue.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.verificationStatus}`);
    });

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testNewUserRegistration();
