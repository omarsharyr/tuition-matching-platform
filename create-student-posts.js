import dotenv from "dotenv";
import connectDB from "./backend/config/db.js";
import TuitionPost from "./backend/models/TuitionPost.js";
import User from "./backend/models/User.js";

dotenv.config({ path: './backend/.env' });

async function createJobPostsForStudent() {
  try {
    await connectDB(process.env.MONGO_URI);
    
    // Find the student with email stu@gmail.com
    const student = await User.findOne({ email: 'stu@gmail.com' });
    if (!student) {
      console.log("❌ Student with email 'stu@gmail.com' not found in database");
      console.log("Available student emails:");
      const students = await User.find({ role: 'student' }).select('name email');
      students.forEach(s => console.log(`- ${s.name} (${s.email})`));
      process.exit(1);
    }
    
    console.log(`✅ Found student: ${student.name} (${student.email})`);
    
    // Check if posts already exist for this student
    const existingPosts = await TuitionPost.countDocuments({ student: student._id });
    console.log(`Current posts for ${student.email}: ${existingPosts}`);
    
    // Create 4 test job posts
    const testPosts = [
      {
        student: student._id,
        title: 'Mathematics & Physics Tutor Needed - HSC 1st Year',
        educationLevel: 'HSC',
        subjects: ['Mathematics', 'Physics'],
        syllabus: 'English',
        description: 'Looking for an experienced tutor to help with HSC 1st year Mathematics and Physics. Need someone who can explain complex concepts clearly.',
        area: 'Dhanmondi, Dhaka',
        exactAddress: 'Road 15, Dhanmondi',
        teachingMode: 'student_home',
        daysPerWeek: 3,
        preferredDays: ['sunday', 'tuesday', 'thursday'],
        preferredTimes: ['evening'],
        paymentType: 'monthly',
        budgetAmount: 8000,
        currency: 'BDT',
        preferredGender: 'any',
        experience: '2+',
        otherPreferences: 'Must be punctual and patient with explanations',
        status: 'active',
        isDraft: false
      },
      {
        student: student._id,
        title: 'English Literature Tutor for A-Levels',
        educationLevel: 'A-Levels',
        subjects: ['English Literature', 'English Language'],
        syllabus: 'Cambridge',
        description: 'Need an expert English Literature tutor for Cambridge A-Levels. Looking for help with poetry analysis, essay writing, and exam techniques.',
        area: 'Gulshan, Dhaka',
        exactAddress: 'Gulshan Avenue',
        teachingMode: 'hybrid',
        daysPerWeek: 2,
        preferredDays: ['saturday', 'monday'],
        preferredTimes: ['afternoon', 'evening'],
        paymentType: 'hourly',
        budgetAmount: 1200,
        currency: 'BDT',
        preferredGender: 'female',
        experience: '3+',
        universityPreference: ['Dhaka University', 'BUET', 'North South University'],
        otherPreferences: 'Must have Cambridge A-Levels teaching experience',
        status: 'active',
        isDraft: false
      },
      {
        student: student._id,
        title: 'Chemistry & Biology Tutor - SSC Preparation',
        educationLevel: 'SSC',
        subjects: ['Chemistry', 'Biology'],
        syllabus: 'Bangla',
        description: 'Preparing for SSC board exam. Need intensive coaching in Chemistry and Biology to improve grades.',
        area: 'Uttara, Dhaka',
        exactAddress: 'Sector 7, Uttara',
        teachingMode: 'student_home',
        daysPerWeek: 4,
        preferredDays: ['sunday', 'monday', 'wednesday', 'friday'],
        preferredTimes: ['afternoon'],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Start in 1 week
        duration: 24, // 24 weeks
        paymentType: 'monthly',
        budgetAmount: 6000,
        currency: 'BDT',
        preferredGender: 'any',
        experience: '1+',
        otherPreferences: 'Should be familiar with Bangla medium syllabus',
        status: 'active',
        isDraft: false
      },
      {
        student: student._id,
        title: 'Online Mathematics Tutor - University 1st Year Calculus',
        educationLevel: 'Univ 1st-2nd yr',
        subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
        syllabus: 'English',
        description: 'University student struggling with Calculus and Linear Algebra. Looking for online tutoring sessions with flexible timing.',
        area: 'Online',
        teachingMode: 'online',
        daysPerWeek: 2,
        preferredDays: ['tuesday', 'thursday'],
        preferredTimes: ['evening', 'night'],
        paymentType: 'per_session',
        budgetAmount: 800,
        currency: 'BDT',
        paymentNotes: 'Payment per 2-hour session',
        preferredGender: 'any',
        experience: '3+',
        universityPreference: ['BUET', 'Dhaka University', 'BRAC University'],
        otherPreferences: 'Must be comfortable with online teaching tools like Zoom/Google Meet',
        status: 'active',
        isDraft: false
      }
    ];
    
    // Insert the posts
    const createdPosts = await TuitionPost.insertMany(testPosts);
    console.log(`✅ Successfully created ${createdPosts.length} job posts for ${student.email}`);
    
    // Display the created posts
    console.log('\n📋 Created Posts:');
    createdPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   - Education Level: ${post.educationLevel}`);
      console.log(`   - Subjects: ${post.subjects.join(', ')}`);
      console.log(`   - Location: ${post.area}`);
      console.log(`   - Mode: ${post.teachingMode}`);
      console.log(`   - Budget: ${post.budgetAmount} BDT (${post.paymentType})`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Post ID: ${post._id}`);
      console.log('');
    });
    
    // Verify total posts for this student
    const totalPosts = await TuitionPost.countDocuments({ student: student._id });
    console.log(`📊 Total posts for ${student.email}: ${totalPosts}`);
    
    // List all active posts in the database
    const allActivePosts = await TuitionPost.find({ status: 'active' }).populate('student', 'name email');
    console.log(`\n🌐 Total active posts in database: ${allActivePosts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating job posts:', error);
    process.exit(1);
  }
}

createJobPostsForStudent();
