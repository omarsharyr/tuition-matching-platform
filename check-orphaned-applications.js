// Check for hidden/orphaned applications that might cause conflicts
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkOrphanedApplications() {
  console.log('🔍 Checking for orphaned applications...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition-matching-platform');
    console.log('✅ Connected to MongoDB');

    const Application = require('./backend/models/Application');
    const User = require('./backend/models/User');
    const TuitionPost = require('./backend/models/TuitionPost');

    // Get test tutor ID
    const testTutor = await User.findOne({ email: 'tutor@test.com' });
    if (!testTutor) {
      console.log('❌ Test tutor not found');
      return;
    }
    console.log('📋 Test tutor ID:', testTutor._id);

    // Check all applications for this tutor
    const allApplications = await Application.find({ tutor: testTutor._id })
      .populate('post', 'title student')
      .populate('tutor', 'name email');

    console.log(`\n📊 Found ${allApplications.length} total applications for test tutor:`);
    
    for (const app of allApplications) {
      console.log(`  Application ID: ${app._id}`);
      console.log(`  Post: ${app.post?.title || 'DELETED POST'} (${app.post?._id || 'NULL'})`);
      console.log(`  Student: ${app.post?.student || 'NULL'}`);
      console.log(`  Status: ${app.status}`);
      console.log(`  Created: ${app.createdAt}`);
      console.log('  ---');
    }

    // Check for applications to deleted posts
    const orphanedApps = await Application.find({ tutor: testTutor._id, post: null });
    console.log(`\n🚨 Orphaned applications (post = null): ${orphanedApps.length}`);

    // Check for applications where post doesn't exist
    const appsWithInvalidPosts = [];
    for (const app of allApplications) {
      if (app.post && app.post._id) {
        const postExists = await TuitionPost.findById(app.post._id);
        if (!postExists) {
          appsWithInvalidPosts.push(app);
        }
      }
    }
    
    console.log(`🚨 Applications to non-existent posts: ${appsWithInvalidPosts.length}`);
    
    // Get the test student
    const testStudent = await User.findOne({ email: 'teststudent@example.com' });
    if (testStudent) {
      console.log('\n📋 Test student ID:', testStudent._id);
      
      // Check applications to this student's posts
      const studentPosts = await TuitionPost.find({ student: testStudent._id });
      console.log(`📝 Test student has ${studentPosts.length} posts`);
      
      for (const post of studentPosts) {
        const appsToPost = await Application.find({ post: post._id, tutor: testTutor._id });
        console.log(`  Post "${post.title}": ${appsToPost.length} applications from test tutor`);
      }
    }

    // Clean up orphaned applications
    if (orphanedApps.length > 0 || appsWithInvalidPosts.length > 0) {
      console.log('\n🧹 Cleaning up orphaned applications...');
      
      await Application.deleteMany({ tutor: testTutor._id, post: null });
      
      for (const app of appsWithInvalidPosts) {
        await Application.findByIdAndDelete(app._id);
      }
      
      console.log('✅ Cleanup complete');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkOrphanedApplications();
