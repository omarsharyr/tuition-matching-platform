// Final test to verify the fix works
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const STUDENT_EMAIL = 'teststudent@example.com';
const STUDENT_PASSWORD = 'testpass123';

// Configure axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testFixedFrontendSubmission() {
  try {
    console.log('🔐 Logging in as student...');
    const loginResponse = await api.post('/auth/login', {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Login successful. User ID:', user.id);

    // Set Authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('\n📝 Testing post creation with CORRECTED values...');
    
    // Test different education levels to ensure they work
    const testCases = [
      {
        title: 'Primary Level English Tutoring',
        educationLevel: 'Primary',
        subjects: ['English', 'Mathematics'],
        syllabus: 'Bangla'
      },
      {
        title: 'O-Levels Physics and Chemistry',
        educationLevel: 'O-Levels', 
        subjects: ['Physics', 'Chemistry'],
        syllabus: 'Cambridge'
      },
      {
        title: 'University Admission Test Prep',
        educationLevel: 'Admission',
        subjects: ['Mathematics', 'Physics'],
        syllabus: 'English'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.title}`);
      
      const wizardPostData = {
        title: testCase.title,
        educationLevel: testCase.educationLevel,
        subjects: testCase.subjects,
        syllabus: testCase.syllabus,
        description: 'Professional tutoring needed',
        area: 'Gulshan',
        teachingMode: 'student_home',
        daysPerWeek: 2,
        preferredDays: ['saturday', 'monday'],
        preferredTimes: ['evening'],
        startDate: '2025-02-15',
        duration: 8,
        paymentType: 'hourly',
        budgetAmount: 1000,
        preferredGender: 'any',
        experience: 'any',
        universityPreference: [],
        otherPreferences: '',
        isDraft: false
      };

      const response = await api.post('/student/posts', wizardPostData);
      console.log(`✅ ${testCase.title} created successfully!`);
      console.log(`   - ID: ${response.data.post._id}`);
      console.log(`   - Status: ${response.data.post.status}`);
    }

    // Fetch all posts to verify
    console.log('\n📋 Fetching all student posts...');
    const fetchResponse = await api.get('/student/posts');
    console.log(`✅ Total posts found: ${fetchResponse.data.posts?.length || 0}`);
    
    fetchResponse.data.posts?.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} (${post.educationLevel}) - ${post.status}`);
    });

  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

testFixedFrontendSubmission();
