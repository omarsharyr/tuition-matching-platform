// Quick test to check tutor vs student IDs
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function checkUserIds() {
  try {
    // Login as student
    console.log('👨‍🎓 Logging in as student...');
    const studentLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });
    console.log('Student ID:', studentLogin.data.user.id);

    // Login as tutor
    console.log('\n👨‍🏫 Logging in as tutor...');
    const tutorLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'tutor@test.com',
      password: '123456'
    });
    console.log('Tutor ID:', tutorLogin.data.user.id);

    // Check if they're the same (shouldn't be!)
    if (studentLogin.data.user.id === tutorLogin.data.user.id) {
      console.log('🚨 ERROR: Student and tutor have the same ID!');
    } else {
      console.log('✅ Student and tutor have different IDs - good');
    }

    // Now check a specific job's student ID
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${tutorLogin.data.token}`,
        'Content-Type': 'application/json'
      }
    });

    const jobsResponse = await api.get('/tutor/jobs');
    const jobs = jobsResponse.data.posts || [];
    
    if (jobs.length > 0) {
      const firstJob = jobs[0];
      console.log('\n📝 First job details:');
      console.log('Job ID:', firstJob._id);
      console.log('Job student ID:', firstJob.student._id);
      console.log('Current tutor ID:', tutorLogin.data.user.id);
      
      if (firstJob.student._id === tutorLogin.data.user.id) {
        console.log('🚨 ERROR: Tutor is trying to apply to their own job!');
      } else {
        console.log('✅ Tutor is applying to someone else\'s job - good');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkUserIds();
