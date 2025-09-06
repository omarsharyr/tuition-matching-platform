const axios = require('axios');

// Test data that matches the PostWizard structure
const testPostData = {
  // Step 1: Class and Subjects
  educationLevel: 'Secondary', // Use valid enum value
  classLevel: 'Class 9',
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  curriculum: 'National',
  
  // Step 2: Schedule and Duration
  preferredDays: ['monday', 'wednesday', 'friday'],
  timeSlots: ['morning', 'afternoon'],
  sessionsPerWeek: 3,
  sessionDuration: 90,
  courseDuration: '6 months',
  startDate: new Date().toISOString().split('T')[0],
  
  // Step 3: Location and Mode
  teachingMode: 'student_home', // Use valid enum value
  location: {
    area: 'Dhanmondi',
    district: 'Dhaka',
    address: '123 Test Street, Dhanmondi, Dhaka'
  },
  
  // Step 4: Budget and Requirements
  budgetType: 'per-month',
  budget: 15000,
  currency: 'BDT',
  negotiable: true,
  requirements: {
    experience: '2+ years',
    qualification: 'Bachelor degree',
    gender: 'any',
    age: 'any'
  },
  
  // Step 5: Additional Information
  description: 'Looking for an experienced tutor for Class 9 Science subjects. The student needs help with Mathematics, Physics, and Chemistry following the National curriculum.',
  specialRequirements: 'Patient and friendly teaching approach preferred.',
  
  // Step 6: Contact and Posting
  urgency: 'moderate',
  visibility: 'public',
  contactPreference: 'platform',
  isDraft: false
};

async function testPostCreation() {
  try {
    console.log('🧪 Testing Post Wizard API...');
    
    // First, login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teststudent@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test data structure
    console.log('📝 Test Data Structure:');
    console.log(JSON.stringify(testPostData, null, 2));
    
    // Test API call with authentication
    console.log('📤 Creating post...');
    const response = await axios.post('http://localhost:5000/api/student/posts', testPostData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Post created successfully:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing post creation:', error.response?.data || error.message);
    
    // Log the detailed error for debugging
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    }
  }
}

testPostCreation();
