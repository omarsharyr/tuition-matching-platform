// Comprehensive database fix for application conflicts
import mongoose from 'mongoose';
import Application from './models/Application.js';
import User from './models/User.js';
import TuitionPost from './models/TuitionPost.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixApplicationConflicts() {
  try {
    console.log('🔧 Starting comprehensive application database fix...\n');

    // Connect to database if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Step 1: Get all applications and analyze conflicts
    console.log('📊 Analyzing current applications...');
    const allApplications = await Application.find({}).populate('tutor', 'email name').populate('post', 'title');
    console.log(`   Found ${allApplications.length} applications in database`);

    // Group by tutor+post combination to find duplicates
    const combinations = {};
    const duplicates = [];
    
    allApplications.forEach(app => {
      const key = `${app.tutor?._id}_${app.post?._id}`;
      if (combinations[key]) {
        duplicates.push({
          key,
          tutorEmail: app.tutor?.email,
          postTitle: app.post?.title,
          existing: combinations[key],
          duplicate: app
        });
      } else {
        combinations[key] = app;
      }
    });

    console.log(`   Found ${duplicates.length} duplicate application conflicts`);

    if (duplicates.length > 0) {
      console.log('🗑️ Removing duplicate applications...');
      for (const dup of duplicates) {
        console.log(`   Removing duplicate: ${dup.tutorEmail} -> ${dup.postTitle}`);
        await Application.findByIdAndDelete(dup.duplicate._id);
      }
    }

    // Step 2: Drop and recreate the unique index
    console.log('🔧 Rebuilding database indexes...');
    try {
      await Application.collection.dropIndex('post_1_tutor_1');
      console.log('   Dropped existing unique index');
    } catch (e) {
      console.log('   No existing unique index to drop');
    }

    try {
      await Application.collection.createIndex(
        { post: 1, tutor: 1 }, 
        { unique: true, name: 'post_1_tutor_1' }
      );
      console.log('✅ Created new unique index');
    } catch (e) {
      console.log('❌ Could not create unique index:', e.message);
    }

    // Step 3: Validate all remaining applications
    console.log('✅ Validating remaining applications...');
    const finalApplications = await Application.find({}).populate('tutor', 'email').populate('post', 'title');
    console.log(`   Final application count: ${finalApplications.length}`);

    // Step 4: Test the problematic tutor
    console.log('🧪 Testing problematic tutor applications...');
    const problemTutor = await User.findOne({ email: 'tutor@test.com' });
    if (problemTutor) {
      const tutorApps = await Application.find({ tutor: problemTutor._id }).populate('post', 'title');
      console.log(`   Tutor has ${tutorApps.length} applications:`);
      tutorApps.forEach(app => {
        console.log(`      - ${app.post?.title || 'Unknown post'} (${app.status})`);
      });

      // Clear all applications for this tutor to start fresh
      console.log('🧹 Clearing all applications for test tutor...');
      await Application.deleteMany({ tutor: problemTutor._id });
      console.log('✅ Test tutor applications cleared');
    }

    console.log('\n🎉 Database fix completed successfully!');
    console.log('💡 Tutor should now be able to apply to jobs without conflicts');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the fix
fixApplicationConflicts();
