import dotenv from "dotenv";
import connectDB from "./config/db.js";
import TuitionPost from "./models/TuitionPost.js";
import User from "./models/User.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log("No student found in database");
      process.exit(1);
    }

    console.log(`Using student: ${student.name} (${student.email})`);

    // Check if posts already exist
    const existingPosts = await TuitionPost.countDocuments();
    console.log(`Current tuition posts: ${existingPosts}`);

    if (existingPosts === 0) {
      // Create some test tuition posts
      const testPosts = [
        {
          student: student._id,
          title: 'Mathematics Tutor Needed - Class 10',
          classLevel: 'Secondary',
          subjects: ['Mathematics'],
          location: 'Dhaka, Bangladesh',
          mode: 'In-person',
          medium: 'English',
          expectedPayment: 5000,
          description: 'Looking for an experienced mathematics tutor for Class 10 student. Need help with algebra and geometry.',
          requirements: 'Bachelor\'s degree in Mathematics or related field',
          preferredGender: 'Any',
          schedule: 'Weekends, 2 hours per day',
          status: 'posted'
        },
        {
          student: student._id,
          title: 'Physics and Chemistry - HSC Level',
          classLevel: 'Higher Secondary',
          subjects: ['Physics', 'Chemistry'],
          location: 'Chittagong, Bangladesh',
          mode: 'Online',
          medium: 'Bengali',
          expectedPayment: 8000,
          description: 'HSC student needs help with Physics and Chemistry. Preparing for university admission.',
          requirements: 'Experience with HSC syllabus required',
          preferredGender: 'Male',
          schedule: 'Weekdays evening, 3 hours per week',
          status: 'posted'
        },
        {
          student: student._id,
          title: 'English Literature Tutor - University Level',
          classLevel: 'University',
          subjects: ['English Literature'],
          location: 'Sylhet, Bangladesh',
          mode: 'Hybrid',
          medium: 'English',
          expectedPayment: 12000,
          description: 'University student needs help with English Literature course work and assignments.',
          requirements: 'Masters in English Literature preferred',
          preferredGender: 'Female',
          schedule: 'Flexible timing, 4 hours per week',
          status: 'posted'
        }
      ];

      const createdPosts = await TuitionPost.insertMany(testPosts);
      console.log(`✅ Created ${createdPosts.length} test tuition posts`);
    } else {
      console.log("Posts already exist, skipping creation");
    }

    // List all posts
    const allPosts = await TuitionPost.find({}).populate('student', 'name email');
    console.log('\nCurrent tuition posts:');
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.classLevel}) - Status: ${post.status} - Student: ${post.student.name}`);
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
