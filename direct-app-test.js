// Simple direct test - just one tutor application
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDirectApplication() {
  console.log('🧪 Testing direct tutor application...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Login as tutor
    console.log('👨‍🏫 Logging in as tutor...');
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    const tutorToken = tutorLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorToken}`;
    console.log('✅ Tutor logged in successfully');

    // Get one job to apply to
    console.log('\n📋 Getting available jobs...');
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || [];
    
    if (jobs.length === 0) {
      console.log('❌ No jobs available');
      return;
    }

    const testJob = jobs[0];
    console.log(`🎯 Testing with job: "${testJob.title}" (${testJob._id})`);

    // Apply directly
    console.log('\n📝 Applying to job...');
    const applicationData = {
      pitch: 'Test application - I am qualified for this position',
      proposedRate: 800,
      availability: ['Monday Morning']
    };

    const applicationResponse = await api.post(`/tutor/jobs/${testJob._id}/apply`, applicationData);
    
    console.log('🎉 SUCCESS! Application submitted!');
    console.log('   Response:', applicationResponse.data);

  } catch (error) {
    console.error('\n❌ Application failed:');
    console.error('   Message:', error.response?.data?.message);
    console.error('   Status:', error.response?.status);
    console.error('   Details:', error.response?.data);
  }
}

testDirectApplication();
