// Simple debug test with more logging
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function simpleApplicationTest() {
  try {
    // Login as tutor
    console.log('👨‍🏫 Logging in as tutor...');
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    const tutorInfo = tutorLogin.data.user;
    console.log('✅ Tutor logged in:', {
      id: tutorInfo.id,
      email: tutorInfo.email,
      isVerified: tutorInfo.isVerified,
      verificationStatus: tutorInfo.verificationStatus
    });

    // Get job board to see what posts are available
    console.log('\n📋 Getting job board...');
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || [];
    console.log(`Found ${jobs.length} jobs on the board`);
    
    if (jobs.length === 0) {
      console.log('❌ No jobs available to apply to');
      return;
    }

    const firstJob = jobs[0];
    console.log('\n📝 First available job:', {
      id: firstJob._id,
      title: firstJob.title,
      student: firstJob.student,
      status: firstJob.status,
      isActive: firstJob.isActive,
      applicationsCount: firstJob.applicationsCount
    });

    // Try to apply to the first job
    console.log('\n🎯 Attempting to apply to first job...');
    
    const applicationData = {
      pitch: 'I am interested in this tutoring opportunity',
      proposedRate: 1000,
      availability: ['Monday', 'Tuesday']
    };

    console.log('Application data:', applicationData);

    const response = await api.post(`/tutor/jobs/${firstJob._id}/apply`, applicationData);
    console.log('✅ Application successful!', {
      applicationId: response.data._id,
      status: response.data.status
    });

  } catch (error) {
    console.error('\n❌ ERROR occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    
    if (error.response?.status === 409) {
      console.log('\n🔍 This is a conflict error - investigating further...');
      
      // Check if there are any applications in the database
      try {
        const appsResponse = await api.get('/tutor/applications');
        console.log('Current applications:', appsResponse.data.applications?.length || 0);
      } catch (e) {
        console.log('Could not fetch current applications');
      }
    }
  }
}

simpleApplicationTest();
