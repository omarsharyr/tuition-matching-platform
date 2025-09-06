// API-based database investigation for application conflicts
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function investigateApplicationConflict() {
  console.log('🔍 Investigating application conflict through API...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Login as admin to access all data
    console.log('👨‍💼 Logging in as admin...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tuition.local',
      password: 'Admin123!'
    });

    const adminToken = adminLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    console.log('✅ Admin logged in');

    // Step 2: Get all applications in the system
    console.log('\n📋 Fetching all applications in system...');
    const allAppsResponse = await api.get('/admin/applications');
    const allApplications = allAppsResponse.data.applications || allAppsResponse.data || [];
    console.log(`📊 Total applications in system: ${allApplications.length}`);

    // Step 3: Filter applications by test tutor
    const tutorId = '68bc3ad2f6bfb223fc2a4b3b'; // From debug output
    const tutorApplications = allApplications.filter(app => 
      (app.tutor?._id || app.tutor) === tutorId
    );
    
    console.log(`📊 Applications by test tutor: ${tutorApplications.length}`);
    
    if (tutorApplications.length > 0) {
      console.log('\n🔍 Test tutor applications found:');
      tutorApplications.forEach((app, index) => {
        console.log(`   ${index + 1}. Post: ${app.post?.title || app.post}`);
        console.log(`      Post ID: ${app.post?._id || app.post}`);
        console.log(`      Status: ${app.status}`);
        console.log(`      Created: ${app.createdAt}`);
        console.log('      ---');
      });
    } else {
      console.log('✅ No applications found for test tutor at admin level');
    }

    // Step 4: Test the application creation directly
    console.log('\n🧪 Testing application creation mechanism...');
    
    // Switch to tutor perspective
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    console.log('✅ Switched to tutor authentication');

    // Get jobs and try to apply
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || jobsResponse.data || [];
    
    if (jobs.length > 0) {
      const testJob = jobs[0];
      console.log(`🎯 Attempting to apply to: ${testJob.title} (${testJob._id})`);
      
      const applicationData = {
        pitch: 'Debug application test',
        proposedRate: testJob.budgetAmount || 1000,
        availability: ['Monday Morning']
      };

      // Capture the exact error
      try {
        const result = await api.post(`/tutor/jobs/${testJob._id}/apply`, applicationData);
        console.log('✅ Application successful:', result.data._id);
        
        // Clean up - delete the test application
        console.log('🧹 Cleaning up test application...');
        await api.delete(`/tutor/applications/${result.data._id}`).catch(() => {
          console.log('   (Cleanup failed - manual deletion may be needed)');
        });
        
      } catch (applyError) {
        console.log('\n❌ APPLICATION FAILED:');
        console.log('   Status:', applyError.response?.status);
        console.log('   Message:', applyError.response?.data?.message);
        console.log('   Error:', applyError.response?.data?.error);
        console.log('   Details:', applyError.response?.data);

        // Check if it's a MongoDB duplicate key error
        if (applyError.response?.data?.message?.includes('duplicate') || 
            applyError.response?.data?.message?.includes('E11000')) {
          console.log('\n🚨 MONGODB DUPLICATE KEY ERROR DETECTED');
          console.log('   This indicates a database constraint violation');
          console.log('   The unique index {post: 1, tutor: 1} is being triggered');
          console.log('   But our queries show no existing application...');
          console.log('\n💡 POSSIBLE CAUSES:');
          console.log('   1. Orphaned applications not visible through API queries');
          console.log('   2. Database corruption or inconsistent state');
          console.log('   3. Race condition in application creation');
          console.log('   4. Index corruption');
        }
      }
    }

    console.log('\n📋 INVESTIGATION SUMMARY:');
    console.log(`   Total applications in system: ${allApplications.length}`);
    console.log(`   Applications by test tutor: ${tutorApplications.length}`);
    console.log('   Conflict occurs at database level despite clean API queries');

  } catch (error) {
    console.error('\n❌ Investigation failed:', error.response?.data?.message || error.message);
  }
}

investigateApplicationConflict();
