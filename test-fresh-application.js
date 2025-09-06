// Targeted fix - try different post and cleanup strategy
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function targetedApplicationTest() {
  console.log('🎯 Targeted application test with different posts...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Login as tutor
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    const tutorId = tutorLogin.data.user.id;
    console.log('✅ Tutor logged in:', tutorId);

    // Get all available jobs
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || jobsResponse.data || [];
    console.log(`📊 Available jobs: ${jobs.length}`);

    // Try each job until one works
    for (let i = 0; i < Math.min(jobs.length, 3); i++) {
      const job = jobs[i];
      console.log(`\n🎯 Testing job ${i + 1}: ${job.title} (${job._id})`);
      
      const applicationData = {
        pitch: `Test application ${i + 1} - I am qualified for this position.`,
        proposedRate: (job.budgetAmount || 1000) - 100,
        availability: ['Monday Morning', 'Tuesday Afternoon']
      };

      try {
        const result = await api.post(`/tutor/jobs/${job._id}/apply`, applicationData);
        console.log('✅ SUCCESS! Application created:', result.data._id);
        console.log('   Status:', result.data.status);
        
        // Test multiple applications to same student but different posts
        if (i < 2) {
          console.log('   Continuing to test next job from same student...');
        }
        
        return; // Exit on first success
        
      } catch (error) {
        console.log('❌ Failed:', error.response?.data?.message);
        if (error.response?.data?.error) {
          console.log('   Error code:', error.response.data.error);
        }
      }
    }
    
    console.log('\n❌ All test jobs failed');
    
    // Alternative approach - try creating a new post and applying to it
    console.log('\n🔄 Alternative approach: Create fresh post and apply...');
    
    // Switch to student to create a new post
    const studentLogin = await api.post('/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${studentLogin.data.token}`;
    
    const newPostData = {
      title: `Fresh Test Post ${Date.now()}`,
      educationLevel: 'O-Levels',
      subjects: ['Mathematics'],
      syllabus: 'Cambridge',
      description: 'Fresh post for testing application system',
      area: 'Gulshan',
      teachingMode: 'student_home',
      daysPerWeek: 2,
      preferredDays: ['monday', 'wednesday'],
      preferredTimes: ['morning'],
      paymentType: 'monthly',
      budgetAmount: 8000,
      isDraft: false
    };
    
    const newPostResponse = await api.post('/student/posts', newPostData);
    const newPost = newPostResponse.data.post;
    console.log('✅ Created fresh post:', newPost._id);
    
    // Switch back to tutor and try applying to the fresh post
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    
    const freshApplicationData = {
      pitch: 'Fresh application to new post',
      proposedRate: 7500,
      availability: ['Monday Morning', 'Wednesday Morning']
    };
    
    try {
      const freshResult = await api.post(`/tutor/jobs/${newPost._id}/apply`, freshApplicationData);
      console.log('✅ SUCCESS on fresh post!', freshResult.data._id);
      console.log('🎉 The application system works with new posts');
      console.log('   Issue appears to be with existing posts that have database conflicts');
    } catch (freshError) {
      console.log('❌ Even fresh post failed:', freshError.response?.data?.message);
      console.log('   This suggests a deeper system issue');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
  }
}

targetedApplicationTest();
