// Direct fix - clean up the problematic tutor account
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function fixTutorAccount() {
  console.log('🛠️  Direct fix for tutor account database issue...\n');

  try {
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Login as admin to access data cleanup functions
    console.log('👨‍💼 Logging in as admin...');
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tuition.local',
      password: 'Admin123!'
    });

    const adminToken = adminLogin.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    console.log('✅ Admin logged in');

    const problematicTutorId = '68bc3ad2f6bfb223fc2a4b3b';
    console.log('🎯 Target tutor ID:', problematicTutorId);

    // Step 1: Find ALL applications by this tutor (including hidden ones)
    console.log('\n📋 Searching for ALL applications by this tutor...');
    const allAppsResponse = await api.get('/admin/applications');
    const allApplications = allAppsResponse.data.applications || allAppsResponse.data || [];
    
    const tutorApps = allApplications.filter(app => {
      const appTutorId = app.tutor?._id || app.tutor;
      return appTutorId === problematicTutorId;
    });
    
    console.log(`📊 Found ${tutorApps.length} applications by this tutor in admin view`);
    
    if (tutorApps.length > 0) {
      console.log('\n🔍 Tutor applications found:');
      tutorApps.forEach((app, index) => {
        console.log(`   ${index + 1}. ID: ${app._id}`);
        console.log(`      Post: ${app.post?.title || 'Unknown'} (${app.post?._id || app.post})`);
        console.log(`      Status: ${app.status}`);
        console.log(`      Created: ${app.createdAt}`);
        console.log('      ---');
      });
      
      // Delete these applications
      console.log('\n🗑️  Attempting to delete orphaned applications...');
      for (const app of tutorApps) {
        try {
          await api.delete(`/admin/applications/${app._id}`);
          console.log(`   ✅ Deleted application ${app._id}`);
        } catch (deleteError) {
          console.log(`   ❌ Failed to delete ${app._id}:`, deleteError.response?.data?.message);
        }
      }
    } else {
      console.log('✅ No applications found in admin view');
    }

    // Step 2: Test application creation after cleanup
    console.log('\n🧪 Testing application creation after cleanup...');
    
    // Switch to tutor account
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    console.log('✅ Switched to tutor account');

    // Get jobs and try to apply
    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || jobsResponse.data || [];
    
    if (jobs.length > 0) {
      const testJob = jobs[0];
      console.log(`🎯 Testing application to: ${testJob.title}`);
      
      const applicationData = {
        pitch: 'Test application after database cleanup',
        proposedRate: (testJob.budgetAmount || 1000) - 300,
        availability: ['Monday Morning', 'Friday Afternoon']
      };

      try {
        const result = await api.post(`/tutor/jobs/${testJob._id}/apply`, applicationData);
        console.log('✅ SUCCESS! Application created after cleanup:', result.data._id);
        console.log('🎉 The fix worked! Tutor can now apply to jobs');
        
        // Get updated applications to verify
        const updatedAppsResponse = await api.get('/tutor/applications');
        const updatedApps = updatedAppsResponse.data.applications || [];
        console.log(`📊 Tutor now has ${updatedApps.length} application(s)`);
        
      } catch (applyError) {
        console.log('❌ Application still failed:', applyError.response?.data?.message);
        console.log('   Error code:', applyError.response?.data?.error);
        
        if (applyError.response?.data?.error === 'DUPLICATE_KEY_RETRY_FAILED') {
          console.log('\n💡 The issue persists - this may require direct database access');
          console.log('   Recommended solutions:');
          console.log('   1. Connect to MongoDB directly and drop the unique index temporarily');
          console.log('   2. Use MongoDB Compass to manually delete orphaned records');
          console.log('   3. Create a new test tutor account for testing');
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Fix attempt failed:', error.response?.data?.message || error.message);
  }
}

fixTutorAccount();
