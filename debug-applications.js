// Check existing applications for debug
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function debugApplications() {
  try {
    // Login as tutor
    const tutorLogin = await api.post('/auth/login', {
      email: 'tutor@test.com',
      password: '123456'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${tutorLogin.data.token}`;
    console.log('✅ Logged in as tutor:', tutorLogin.data.user.id);

    // Get all applications for this tutor
    const appsResponse = await api.get('/tutor/applications');
    const applications = appsResponse.data.applications || [];
    
    console.log(`\n📋 Tutor has ${applications.length} existing applications:`);
    
    applications.forEach((app, index) => {
      console.log(`   ${index + 1}. Post ID: ${app.post?._id || app.post}`);
      console.log(`      Title: ${app.post?.title || 'Unknown'}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${new Date(app.createdAt).toLocaleString()}`);
      console.log('      ---');
    });

    // Also get recent posts from the student
    const studentLogin = await api.post('/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${studentLogin.data.token}`;
    console.log('\n✅ Logged in as student:', studentLogin.data.user.id);

    const postsResponse = await api.get('/student/posts');
    const posts = postsResponse.data.posts || [];
    
    console.log(`\n📝 Student has ${posts.length} posts:`);
    
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ID: ${post._id}`);
      console.log(`      Title: ${post.title}`);
      console.log(`      Status: ${post.status}`);
      console.log(`      Applications: ${post.applicationsCount || 0}`);
      console.log(`      Created: ${new Date(post.createdAt).toLocaleString()}`);
      console.log('      ---');
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

debugApplications();
