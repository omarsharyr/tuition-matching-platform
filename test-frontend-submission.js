// Test frontend post submission with detailed logging
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

async function testFrontendPostSubmission() {
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

    console.log('\n📝 Testing post creation that matches frontend wizard format...');
    
    // This is the exact format that would come from the frontend PostWizard
    const wizardPostData = {
      // Step 1: Class & Subjects
      title: 'Need Math and Physics Tutor for HSC',
      educationLevel: 'HSC',
      subjects: ['Mathematics', 'Physics'],
      syllabus: 'English',
      description: 'Need help with advanced mathematics and physics',
      
      // Step 2: Location
      area: 'Dhanmondi',
      teachingMode: 'student_home',
      
      // Step 3: Schedule
      daysPerWeek: 3,
      preferredDays: ['sunday', 'tuesday', 'thursday'],
      preferredTimes: ['morning', 'evening'],
      startDate: '2025-02-01',
      duration: 12,
      
      // Step 4: Budget
      paymentType: 'monthly',
      budgetAmount: 8000,
      paymentNotes: 'Negotiable based on experience',
      
      // Step 5: Tutor Preferences
      preferredGender: 'any',
      experience: 'any',
      universityPreference: [],
      otherPreferences: '',
      
      // Step 6: Submission
      isDraft: false  // This should be false for "Publish Post"
    };

    console.log('Wizard data to submit:', JSON.stringify(wizardPostData, null, 2));
    
    const response = await api.post('/student/posts', wizardPostData);
    
    console.log('\n✅ POST CREATION SUCCESSFUL!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    // Test fetching the posts to confirm it was created
    console.log('\n📋 Fetching all posts to verify...');
    const fetchResponse = await api.get('/student/posts');
    console.log('✅ Total posts found:', fetchResponse.data.posts?.length || 0);
    
    if (fetchResponse.data.posts?.length > 0) {
      const latestPost = fetchResponse.data.posts[fetchResponse.data.posts.length - 1];
      console.log('Latest post details:');
      console.log('- ID:', latestPost._id);
      console.log('- Title:', latestPost.title || 'No title');
      console.log('- Status:', latestPost.status);
      console.log('- IsActive:', latestPost.isActive);
      console.log('- IsDraft:', latestPost.isDraft);
      console.log('- Class:', latestPost.class);
      console.log('- Subjects:', latestPost.subjects);
    }

  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    console.error('\nFull Error Details:', error);
  }
}

// Run the test
testFrontendPostSubmission();
