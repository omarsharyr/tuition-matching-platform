import axios from 'axios';

// Test post creation with a student account
async function testPostCreation() {
  try {
    console.log('🧪 Testing Student Post Creation...\n');

    // Test login as student first
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teststudent@example.com',
      password: 'testpass123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Student login successful');
      const token = loginResponse.data.token;
      
      // Test post creation
      console.log('\n2. Testing post creation...');
      const postData = {
        title: 'Test Mathematics Tutor Needed',
        educationLevel: 'HSC',
        subjects: ['Mathematics', 'Physics'],
        syllabus: 'English',
        description: 'Looking for an experienced tutor to help with HSC Mathematics and Physics.',
        area: 'Dhanmondi, Dhaka',
        exactAddress: 'Road 10, Dhanmondi',
        teachingMode: 'student_home',
        daysPerWeek: 3,
        preferredDays: ['sunday', 'tuesday', 'thursday'],
        preferredTimes: ['evening'],
        paymentType: 'monthly',
        budgetAmount: 8000,
        currency: 'BDT',
        preferredGender: 'any',
        experience: '1-3',
        isDraft: false
      };
      
      const createResponse = await axios.post('http://localhost:5000/api/student/posts', postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Post created successfully!');
        console.log('Post ID:', createResponse.data.post._id);
        console.log('Title:', createResponse.data.post.title);
        console.log('Status:', createResponse.data.post.status);
        
        // Test fetching student's posts
        console.log('\n3. Testing post retrieval...');
        const postsResponse = await axios.get('http://localhost:5000/api/student/posts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Posts retrieved successfully');
        console.log('Total posts:', postsResponse.data.posts?.length || 0);
        
      } else {
        console.log('❌ Post creation failed:', createResponse.data.message);
      }
      
    } else {
      console.log('❌ Student login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

testPostCreation();
