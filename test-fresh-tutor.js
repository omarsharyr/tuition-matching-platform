// Test with the fresh tutor via API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testWithFreshTutor() {
  try {
    // First register a completely new tutor
    console.log('🆕 Registering new tutor...');
    
    const registerData = {
      name: 'New Fresh Tutor',
      email: 'freshtutor@test.com', 
      password: '123456',
      role: 'tutor',
      location: {
        type: 'Point',
        coordinates: [90.3563, 23.7465]
      }
    };

    try {
      const registerResponse = await api.post('/auth/register', registerData);
      console.log('✅ New tutor registered:', registerResponse.data.user.id);
    } catch (regError) {
      if (regError.response?.status === 400 && regError.response?.data?.message.includes('already exists')) {
        console.log('ℹ️ Tutor already exists, continuing with login...');
      } else {
        throw regError;
      }
    }

    // Login with this tutor
    console.log('\n👨‍🏫 Logging in as fresh tutor...');
    const loginResponse = await api.post('/auth/login', {
      email: 'freshtutor@test.com',
      password: '123456'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
    console.log('✅ Fresh tutor logged in:', {
      id: loginResponse.data.user.id,
      email: loginResponse.data.user.email,
      isVerified: loginResponse.data.user.isVerified
    });

    // Check applications first
    console.log('\n📋 Checking existing applications...');
    const myAppsResponse = await api.get('/tutor/applications');
    console.log(`Current applications: ${myAppsResponse.data.applications?.length || 0}`);

    // Get job board  
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || [];
    console.log(`Available jobs: ${jobs.length}`);

    if (jobs.length === 0) {
      console.log('❌ No jobs available');
      return;
    }

    // Try to apply to the first job
    const firstJob = jobs[0];
    console.log('\n🎯 Applying to job:', {
      id: firstJob._id,
      title: firstJob.title
    });

    const applicationData = {
      pitch: 'I am very interested in this position',
      proposedRate: 800,
      availability: ['Monday', 'Wednesday', 'Friday']
    };

    const applyResponse = await api.post(`/tutor/jobs/${firstJob._id}/apply`, applicationData);
    console.log('✅ Application successful!', {
      applicationId: applyResponse.data._id,
      status: applyResponse.data.status
    });

    // Now try to apply to a SECOND job from the same student
    console.log('\n🎯 Now trying to apply to another job from the same student...');
    
    const sameStudentJobs = jobs.filter(job => job.student._id === firstJob.student._id);
    console.log(`Found ${sameStudentJobs.length} jobs from the same student`);

    if (sameStudentJobs.length > 1) {
      const secondJob = sameStudentJobs[1];
      console.log('Applying to second job:', {
        id: secondJob._id,
        title: secondJob.title
      });

      const secondAppResponse = await api.post(`/tutor/jobs/${secondJob._id}/apply`, applicationData);
      console.log('✅ Second application successful!', {
        applicationId: secondAppResponse.data._id,
        status: secondAppResponse.data.status
      });
      
      console.log('\n🎉 SUCCESS: Tutor can apply to multiple jobs from same student!');
    } else {
      console.log('ℹ️ Only one job from this student, cannot test multiple applications');
    }

  } catch (error) {
    console.error('\n❌ ERROR occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('URL:', error.config?.url);

    if (error.response?.status === 409) {
      console.log('\n🚨 CONFIRMED: This is the bug - getting duplicate error when it should work');
    }
  }
}

testWithFreshTutor();
