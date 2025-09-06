// Simple approach - just delete all applications and rebuild index
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetApplications() {
  try {
    console.log('🔧 Resetting applications collection...\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const applicationsCollection = db.collection('applications');

    // Count existing applications
    const count = await applicationsCollection.countDocuments();
    console.log(`📊 Current applications: ${count}`);

    // Show existing applications
    const allApps = await applicationsCollection.find({}).toArray();
    console.log('📋 Existing applications:');
    allApps.forEach((app, index) => {
      console.log(`   ${index + 1}. ID: ${app._id}, post: ${app.post}, tutor: ${app.tutor}, status: ${app.status}`);
    });

    // Drop the entire collection to start fresh
    console.log('\n🗑️ Dropping applications collection...');
    try {
      await applicationsCollection.drop();
      console.log('✅ Applications collection dropped');
    } catch (e) {
      console.log('   Collection already empty or doesn\'t exist');
    }

    // Recreate collection with proper index
    console.log('\n🔧 Creating new applications collection with index...');
    await applicationsCollection.createIndex(
      { post: 1, tutor: 1 },
      { 
        unique: true,
        name: 'post_1_tutor_1'
      }
    );
    console.log('✅ Created unique index on post + tutor');

    console.log('\n🎉 Applications collection reset successfully!');
    console.log('💡 Tutor applications should now work properly!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

resetApplications();
