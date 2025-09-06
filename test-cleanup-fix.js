// Test the new admin cleanup endpoint to fix application conflicts
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCleanupAndApplications() {
  console.log('🧹 Testing admin cleanup endpoint and application system...\n');

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
    console.log('✅ Admin logged in');

    // Step 2: Run the cleanup endpoint
    console.log('\n🧹 Running application database cleanup...');
    const cleanupResponse = await api.post('/admin/cleanup/applications');
    const cleanupResult = cleanupResponse.data;
    
    console.log('✅ Cleanup completed!');
    console.log('📊 Cleanup Results:');
    console.log(`   Applications before: ${cleanupResult.cleanup.totalApplicationsBefore}`);
    console.log(`   Applications after: ${cleanupResult.cleanup.totalApplicationsAfter}`);
    console.log(`   Cleaned up: ${cleanupResult.cleanup.cleanedUpCount}`);
    console.log(`   Issues found: ${cleanupResult.cleanup.issuesFound}`);
    
    if (cleanupResult.cleanup.issues.length > 0) {
      console.log('\n🔍 Issues that were fixed:');
      cleanupResult.cleanup.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. Application ${issue._id}:`);
        issue.problems.forEach(problem => {
          console.log(`      - ${problem}`);
        });
      });
    }

    // Step 3: Test tutor application after cleanup
    console.log('\n🧪 Testing tutor application after cleanup...');
    
    // Login as tutor
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    console.log('✅ Tutor logged in');

    // Get jobs
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || jobsResponse.data || [];
    console.log(`📊 Available jobs: ${jobs.length}`);

    if (jobs.length > 0) {
      const testJob = jobs[0];
      console.log(`🎯 Attempting application to: ${testJob.title} (${testJob._id})`);
      
      const applicationData = {
        pitch: 'Post-cleanup test application - I am qualified for this position.',
        proposedRate: (testJob.budgetAmount || 1000) - 200,
        availability: ['Monday Morning', 'Wednesday Evening', 'Friday Afternoon']
      };

      try {
        const result = await api.post(`/tutor/jobs/${testJob._id}/apply`, applicationData);
        console.log('✅ SUCCESS! Application created:', result.data._id);
        console.log('🎉 THE FIX WORKED! Tutor can now apply to jobs!');
        
        // Verify the application was created
        const applicationsResponse = await api.get('/tutor/applications');
        const applications = applicationsResponse.data.applications || [];
        console.log(`📊 Tutor now has ${applications.length} application(s)`);
        
        console.log('\n🎯 Testing second application to different job...');
        if (jobs.length > 1) {
          const secondJob = jobs[1];
          const secondAppData = {
            pitch: 'Second test application to verify multiple applications work',
            proposedRate: (secondJob.budgetAmount || 1000) - 150,
            availability: ['Tuesday Morning', 'Thursday Evening']
          };
          
          const secondResult = await api.post(`/tutor/jobs/${secondJob._id}/apply`, secondAppData);
          console.log('✅ Second application also successful:', secondResult.data._id);
          
          const finalAppsResponse = await api.get('/tutor/applications');
          const finalApps = finalAppsResponse.data.applications || [];
          console.log(`📊 Tutor now has ${finalApps.length} application(s) total`);
          console.log('🎉 Multiple applications work correctly!');
        }
        
        return;
        
      } catch (applyError) {
        console.log('❌ Application still failed after cleanup:', applyError.response?.data?.message);
        console.log('   Status:', applyError.response?.status);
        console.log('   Full error:', applyError.response?.data);
        
        // If cleanup didn't work, the issue might be deeper
        console.log('\n💡 If cleanup didn\'t resolve the issue, this might need:');
        console.log('   1. Direct MongoDB database inspection');
        console.log('   2. Complete database reset (test environment only)');
        console.log('   3. Migration to clean database instance');
      }
    } else {
      console.log('❌ No jobs available to test with');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 404) {
      console.log('💡 The cleanup endpoint might not be available - check server restart needed');
    }
  }
}

testCleanupAndApplications();
