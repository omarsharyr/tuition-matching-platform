// Fix the null values in applications collection
import mongoose from 'mongoose';
import Application from './models/Application.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixNullApplications() {
  try {
    console.log('🔧 Fixing null values in applications collection...\n');

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Find documents with null postId or tutorId
    console.log('🔍 Looking for applications with null values...');
    const nullApplications = await Application.find({
      $or: [
        { post: null },
        { tutor: null },
        { post: { $exists: false } },
        { tutor: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${nullApplications.length} applications with null values`);

    if (nullApplications.length > 0) {
      console.log('🗑️ Removing corrupted applications...');
      nullApplications.forEach((app, index) => {
        console.log(`   ${index + 1}. ID: ${app._id}, post: ${app.post}, tutor: ${app.tutor}`);
      });

      // Delete all applications with null values
      const deleteResult = await Application.deleteMany({
        $or: [
          { post: null },
          { tutor: null },
          { post: { $exists: false } },
          { tutor: { $exists: false } }
        ]
      });

      console.log(`✅ Deleted ${deleteResult.deletedCount} corrupted applications`);
    }

    // Check final state
    console.log('\n📊 Final application count:');
    const finalCount = await Application.countDocuments();
    console.log(`   Total applications: ${finalCount}`);

    const validApplications = await Application.find({}).populate('post', 'title').populate('tutor', 'email');
    console.log('\n📋 Valid applications:');
    validApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.tutor?.email || 'Unknown'} -> ${app.post?.title || 'Unknown'}`);
    });

    // Rebuild the index to be safe
    console.log('\n🔧 Rebuilding unique index...');
    try {
      await Application.collection.dropIndex('postId_1_tutorId_1');
      console.log('   Dropped old index');
    } catch (e) {
      console.log('   No old index found');
    }

    try {
      await Application.collection.dropIndex('post_1_tutor_1');
      console.log('   Dropped new index');
    } catch (e) {
      console.log('   No new index found');
    }

    // Create proper index
    await Application.collection.createIndex(
      { post: 1, tutor: 1 }, 
      { 
        unique: true, 
        name: 'post_1_tutor_1',
        partialFilterExpression: {
          post: { $type: "objectId" },
          tutor: { $type: "objectId" }
        }
      }
    );
    console.log('✅ Created new unique index with partial filter');

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('💡 Applications should now work properly!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixNullApplications();
