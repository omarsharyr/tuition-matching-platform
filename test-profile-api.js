// Test script for profile API endpoints
const API_BASE = 'http://localhost:3001/api';

// You'll need to get a real JWT token from login
const TEST_TOKEN = 'your_jwt_token_here';

const testStudentProfile = async () => {
  console.log('\n=== Testing Student Profile API ===');
  
  try {
    // Test get profile
    const getResponse = await fetch(`${API_BASE}/students/profile`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const profile = await getResponse.json();
      console.log('✅ Get Profile Success:', profile.success);
    } else {
      console.log('❌ Get Profile Failed:', await getResponse.text());
    }

    // Test profile completion
    const completionResponse = await fetch(`${API_BASE}/students/profile/completion`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (completionResponse.ok) {
      const completion = await completionResponse.json();
      console.log('✅ Profile Completion:', completion.completionPercentage + '%');
      console.log('Missing fields:', completion.missingFields);
    } else {
      console.log('❌ Profile Completion Failed:', await completionResponse.text());
    }

    // Test update profile
    const updateData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+8801234567890',
      bio: 'Updated bio for testing'
    };

    const updateResponse = await fetch(`${API_BASE}/students/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Update Profile Success:', result.success);
    } else {
      console.log('❌ Update Profile Failed:', await updateResponse.text());
    }

  } catch (error) {
    console.error('❌ Student Profile Test Error:', error);
  }
};

const testTutorProfile = async () => {
  console.log('\n=== Testing Tutor Profile API ===');
  
  try {
    // Test get profile
    const getResponse = await fetch(`${API_BASE}/tutors/profile`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const profile = await getResponse.json();
      console.log('✅ Get Profile Success:', profile.success);
    } else {
      console.log('❌ Get Profile Failed:', await getResponse.text());
    }

    // Test profile completion
    const completionResponse = await fetch(`${API_BASE}/tutors/profile/completion`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (completionResponse.ok) {
      const completion = await completionResponse.json();
      console.log('✅ Profile Completion:', completion.completionPercentage + '%');
      console.log('Missing fields:', completion.missingFields);
    } else {
      console.log('❌ Profile Completion Failed:', await completionResponse.text());
    }

    // Test update profile
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+8801234567891',
      bio: 'Updated tutor bio for testing',
      subjects: ['Mathematics', 'Physics'],
      educationLevels: ['Higher Secondary', 'Undergraduate'],
      hourlyRate: 500,
      teachingMode: ['In-person', 'Online']
    };

    const updateResponse = await fetch(`${API_BASE}/tutors/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Update Profile Success:', result.success);
    } else {
      console.log('❌ Update Profile Failed:', await updateResponse.text());
    }

    // Test add work experience
    const workExperience = {
      title: 'Mathematics Tutor',
      institution: 'ABC Academy',
      duration: '2 years',
      description: 'Taught advanced mathematics to high school students',
      startDate: '2022-01-01',
      endDate: '2024-01-01',
      current: false
    };

    const workExpResponse = await fetch(`${API_BASE}/tutors/profile/work-experience`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workExperience)
    });
    
    if (workExpResponse.ok) {
      const result = await workExpResponse.json();
      console.log('✅ Add Work Experience Success:', result.success);
    } else {
      console.log('❌ Add Work Experience Failed:', await workExpResponse.text());
    }

  } catch (error) {
    console.error('❌ Tutor Profile Test Error:', error);
  }
};

// Instructions for running tests
console.log('Profile API Test Script');
console.log('=======================');
console.log('1. Start your backend server (npm run dev)');
console.log('2. Login as a student/tutor to get a JWT token');
console.log('3. Replace TEST_TOKEN with your actual token');
console.log('4. Run: node test-profile-api.js');
console.log('');

// Uncomment these lines after setting up your token:
// testStudentProfile();
// testTutorProfile();

// Example API endpoints available:
console.log('Available Profile API Endpoints:');
console.log('');
console.log('Student Endpoints:');
console.log('  GET    /api/students/profile');
console.log('  PUT    /api/students/profile');
console.log('  POST   /api/students/profile/image');
console.log('  GET    /api/students/profile/completion');
console.log('');
console.log('Tutor Endpoints:');
console.log('  GET    /api/tutors/profile');
console.log('  PUT    /api/tutors/profile');
console.log('  POST   /api/tutors/profile/image');
console.log('  GET    /api/tutors/profile/completion');
console.log('  POST   /api/tutors/profile/work-experience');
console.log('  PUT    /api/tutors/profile/work-experience/:experienceId');
console.log('  DELETE /api/tutors/profile/work-experience/:experienceId');
