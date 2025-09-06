// Final comprehensive test for the application fix
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testApplicationFix() {
  console.log('🧪 Testing tutor application fix...\n');

  try {
    // Create API instance
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Step 1: Login as student and create two posts
    console.log('👨‍🎓 Setting up test data as student...');
    const studentLogin = await api.post('/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${studentLogin.data.token}`;
    console.log('✅ Student logged in');

    // Create two different posts
    const post1Data = {
      title: 'Chemistry Tutor Needed - O Levels',
      educationLevel: 'O-Levels',
      subjects: ['Chemistry'],
      syllabus: 'Cambridge',
      description: 'Need help with organic chemistry',
      area: 'Gulshan',
      teachingMode: 'student_home',
      daysPerWeek: 2,
      preferredDays: ['saturday', 'sunday'],
      preferredTimes: ['morning'],
      paymentType: 'hourly',
      budgetAmount: 1200,
      isDraft: false
    };

    const post2Data = {
      title: 'Biology Tutor Needed - O Levels',
      educationLevel: 'O-Levels',
      subjects: ['Biology'],
      syllabus: 'Cambridge',
      description: 'Need help with human biology',
      area: 'Gulshan',
      teachingMode: 'student_home',
      daysPerWeek: 3,
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredTimes: ['afternoon'],
      paymentType: 'monthly',
      budgetAmount: 7000,
      isDraft: false
    };

    const post1Response = await api.post('/student/posts', post1Data);
    const post2Response = await api.post('/student/posts', post2Data);
    
    const post1Id = post1Response.data.post._id;
    const post2Id = post2Response.data.post._id;
    
    console.log('✅ Created test posts:');
    console.log(`   Post 1: ${post1Id} - ${post1Data.title}`);
    console.log(`   Post 2: ${post2Id} - ${post2Data.title}`);

    // Step 2: Login as tutor
    console.log('\n👨‍🏫 Switching to tutor perspective...');
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    console.log('✅ Tutor logged in:', tutorLogin.data.user.id);

    // Step 3: Check existing applications
    const existingApps = await api.get('/tutor/applications');
    console.log(`📋 Existing applications: ${existingApps.data.applications?.length || 0}`);

    // Step 4: Apply to first post
    console.log('\n🎯 Applying to first post...');
    const app1Data = {
      pitch: 'I have 3 years of experience teaching Chemistry',
      proposedRate: 1100,
      availability: ['Saturday Morning', 'Sunday Morning']
    };

    try {
      const app1Response = await api.post(`/tutor/jobs/${post1Id}/apply`, app1Data);
      console.log('✅ First application successful:', app1Response.data._id);
    } catch (error) {
      console.log('❌ First application failed:', error.response?.data?.message);
      return;
    }

    // Step 5: Apply to second post (this should work now!)
    console.log('\n🎯 Applying to second post from the same student...');
    const app2Data = {
      pitch: 'I also teach Biology and have helped many students with O Levels',
      proposedRate: 6500,
      availability: ['Monday Afternoon', 'Wednesday Afternoon', 'Friday Afternoon']
    };

    try {
      const app2Response = await api.post(`/tutor/jobs/${post2Id}/apply`, app2Data);
      console.log('✅ Second application successful:', app2Response.data._id);
      console.log('🎉 SUCCESS: Tutor can apply to multiple jobs from the same student!');
    } catch (error) {
      console.log('❌ Second application failed:', error.response?.data?.message);
      console.log('🚨 BUG CONFIRMED: Cannot apply to multiple jobs from same student');
    }

    // Step 6: Try to apply to the same post again (this should fail)
    console.log('\n🚫 Testing duplicate application prevention...');
    try {
      await api.post(`/tutor/jobs/${post1Id}/apply`, app1Data);
      console.log('❌ ERROR: Duplicate application was allowed!');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Correctly prevented duplicate application');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error preventing duplicate:', error.response?.data?.message);
      }
    }

    // Step 7: Verify final state
    console.log('\n📋 Final verification...');
    const finalApps = await api.get('/tutor/applications');
    const apps = finalApps.data.applications || [];
    console.log(`✅ Total applications: ${apps.length}`);
    
    apps.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.post?.title} - Status: ${app.status}`);
    });

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testApplicationFix();
