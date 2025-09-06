// Test tutor application functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testTutorApplications() {
  try {
    console.log('🧪 Testing tutor application functionality...');

    // Step 1: Login as test student
    console.log('\n👨‍🎓 Logging in as student...');
    const studentLogin = await api.post('/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });

    const studentToken = studentLogin.data.token;
    const studentId = studentLogin.data.user.id;
    console.log('✅ Student logged in:', studentId);

    // Set student token
    api.defaults.headers.common['Authorization'] = `Bearer ${studentToken}`;

    // Step 2: Create multiple posts by the same student
    console.log('\n📝 Creating multiple posts by the same student...');
    
    const post1Data = {
      title: 'Math Tutoring for Grade 10',
      educationLevel: 'Secondary',
      subjects: ['Mathematics'],
      syllabus: 'English',
      description: 'Need help with algebra and geometry',
      area: 'Dhanmondi',
      teachingMode: 'student_home',
      daysPerWeek: 2,
      preferredDays: ['saturday', 'sunday'],
      preferredTimes: ['morning'],
      paymentType: 'hourly',
      budgetAmount: 800,
      isDraft: false
    };

    const post2Data = {
      title: 'Physics Tutoring for Grade 11',
      educationLevel: 'HSC',
      subjects: ['Physics'],
      syllabus: 'English',
      description: 'Need help with mechanics and waves',
      area: 'Dhanmondi',
      teachingMode: 'student_home',
      daysPerWeek: 3,
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredTimes: ['evening'],
      paymentType: 'monthly',
      budgetAmount: 6000,
      isDraft: false
    };

    const post1Response = await api.post('/student/posts', post1Data);
    const post2Response = await api.post('/student/posts', post2Data);
    
    const post1Id = post1Response.data.post._id;
    const post2Id = post2Response.data.post._id;
    
    console.log('✅ Created Post 1:', post1Id);
    console.log('✅ Created Post 2:', post2Id);

    // Step 3: Login as tutor
    console.log('\n👨‍🏫 Logging in as tutor...');
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    const tutorToken = tutorLogin.data.token;
    const tutorId = tutorLogin.data.user.id;
    console.log('✅ Tutor logged in:', tutorId);

    // Set tutor token
    api.defaults.headers.common['Authorization'] = `Bearer ${tutorToken}`;

    // Step 4: Apply to first post
    console.log('\n📝 Applying to first post...');
    const app1Data = {
      pitch: 'I am experienced in teaching math to high school students',
      proposedRate: 750,
      availability: ['Saturday Morning', 'Sunday Morning']
    };

    const app1Response = await api.post(`/tutor/jobs/${post1Id}/apply`, app1Data);
    console.log('✅ Application 1 successful:', app1Response.data._id);

    // Step 5: Apply to second post (this should work!)
    console.log('\n📝 Applying to second post from same student...');
    const app2Data = {
      pitch: 'I have PhD in Physics and can help with advanced concepts',
      proposedRate: 5500,
      availability: ['Monday Evening', 'Wednesday Evening', 'Friday Evening']
    };

    const app2Response = await api.post(`/tutor/jobs/${post2Id}/apply`, app2Data);
    console.log('✅ Application 2 successful:', app2Response.data._id);

    // Step 6: Try to apply to the same post again (this should fail)
    console.log('\n🚫 Trying to apply to first post again (should fail)...');
    try {
      await api.post(`/tutor/jobs/${post1Id}/apply`, app1Data);
      console.log('❌ ERROR: Duplicate application was allowed!');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Correctly blocked duplicate application:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Step 7: Verify both applications exist
    console.log('\n📋 Fetching tutor\'s applications...');
    const myAppsResponse = await api.get('/tutor/applications');
    console.log(`✅ Tutor has ${myAppsResponse.data.applications?.length || 0} applications total`);
    
    myAppsResponse.data.applications?.forEach((app, index) => {
      console.log(`   ${index + 1}. Post: ${app.post.title} - Status: ${app.status}`);
    });

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ ERROR occurred:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Details:', error.response?.data);
  }
}

testTutorApplications();
