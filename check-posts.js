// Check post structure to understand mapping
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function checkPostStructure() {
  try {
    // Login as student
    const studentLogin = await api.post('/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${studentLogin.data.token}`;

    // Get student's posts
    const postsResponse = await api.get('/student/posts');
    const posts = postsResponse.data.posts || [];
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log('📝 First post structure:');
      console.log('New fields:');
      console.log('  educationLevel:', firstPost.educationLevel);
      console.log('  area:', firstPost.area);
      console.log('  teachingMode:', firstPost.teachingMode);
      console.log('  paymentType:', firstPost.paymentType);
      console.log('  budgetAmount:', firstPost.budgetAmount);
      
      console.log('\nLegacy fields (mapped):');
      console.log('  classLevel:', firstPost.classLevel);
      console.log('  location:', firstPost.location);
      console.log('  mode:', firstPost.mode);
      console.log('  expectedPayment:', firstPost.expectedPayment);
      
      console.log('\nStatus fields:');
      console.log('  status:', firstPost.status);
      console.log('  isActive:', firstPost.isActive);
      console.log('  isDraft:', firstPost.isDraft);
    }

    // Now login as tutor and try manual query
    console.log('\n👨‍🏫 Now checking from tutor perspective...');
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;

    // Try job board with no filters
    const jobsResponse = await api.get('/tutor/jobs');
    console.log(`\n📋 Job board returned ${jobsResponse.data.posts?.length || 0} jobs`);
    console.log('Query response structure:', {
      posts: Array.isArray(jobsResponse.data.posts),
      pagination: jobsResponse.data.pagination,
      total: jobsResponse.data.pagination?.total
    });

    if (jobsResponse.data.posts?.length > 0) {
      console.log('\nFirst job on board:', {
        id: jobsResponse.data.posts[0]._id,
        title: jobsResponse.data.posts[0].title,
        classLevel: jobsResponse.data.posts[0].classLevel,
        location: jobsResponse.data.posts[0].location,
        status: jobsResponse.data.posts[0].status
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkPostStructure();
