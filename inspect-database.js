// Direct MongoDB inspection for application conflicts
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017/tuition_matching_platform';

async function inspectDatabase() {
  console.log('🔍 Direct MongoDB inspection for application conflicts...\n');

  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('tuition_matching_platform');
    const applicationsCollection = db.collection('applications');
    const usersCollection = db.collection('users');
    const postsCollection = db.collection('tuitionposts');

    // Find our tutor
    console.log('\n👨‍🏫 Finding tutor user...');
    const tutor = await usersCollection.findOne({ email: 'tutor@test.com' });
    if (!tutor) {
      console.log('❌ Tutor not found!');
      return;
    }
    console.log(`✅ Found tutor: ${tutor._id} (${tutor.email})`);

    // Find the post they're trying to apply to
    console.log('\n📋 Finding posts...');
    const posts = await postsCollection.find({}).toArray();
    console.log(`✅ Found ${posts.length} posts`);
    
    if (posts.length > 0) {
      const testPost = posts[0];
      console.log(`🎯 Test post: ${testPost._id} - ${testPost.title}`);
      
      // Check for ANY applications from this tutor to this post
      console.log('\n🔍 Checking for existing applications...');
      const applications = await applicationsCollection.find({
        tutor: tutor._id,
        post: testPost._id
      }).toArray();
      
      console.log(`📊 Found ${applications.length} application(s) for this tutor-post combination`);
      
      if (applications.length > 0) {
        console.log('📝 Application details:');
        applications.forEach((app, index) => {
          console.log(`   ${index + 1}. ID: ${app._id}`);
          console.log(`      Status: ${app.status}`);
          console.log(`      Created: ${app.createdAt}`);
          console.log(`      Post: ${app.post}`);
          console.log(`      Tutor: ${app.tutor}`);
        });
        
        // Try to delete these conflicting applications
        console.log('\n🧹 Attempting to delete conflicting applications...');
        const deleteResult = await applicationsCollection.deleteMany({
          tutor: tutor._id,
          post: testPost._id
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} conflicting applications`);
      } else {
        console.log('✅ No existing applications found - conflict might be index-level');
      }
      
      // Check for ANY applications from this tutor
      console.log('\n📊 Checking ALL applications from this tutor...');
      const allTutorApps = await applicationsCollection.find({
        tutor: tutor._id
      }).toArray();
      
      console.log(`📊 Tutor has ${allTutorApps.length} total application(s)`);
      if (allTutorApps.length > 0) {
        console.log('📝 All tutor applications:');
        allTutorApps.forEach((app, index) => {
          console.log(`   ${index + 1}. Post: ${app.post}, Status: ${app.status}`);
        });
      }
      
      // Check the collection indexes
      console.log('\n🔍 Checking collection indexes...');
      const indexes = await applicationsCollection.indexes();
      console.log('📝 Current indexes:');
      indexes.forEach((index, i) => {
        console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
        if (index.unique) console.log(`      (UNIQUE INDEX)`);
      });
      
      // Try to drop and recreate the unique index
      console.log('\n🔧 Attempting to rebuild unique index...');
      try {
        // Drop existing unique index
        await applicationsCollection.dropIndex('post_1_tutor_1');
        console.log('✅ Dropped existing unique index');
      } catch (e) {
        console.log(`⚠️  Could not drop index: ${e.message}`);
      }
      
      try {
        // Recreate unique index
        await applicationsCollection.createIndex(
          { post: 1, tutor: 1 }, 
          { unique: true, name: 'post_1_tutor_1' }
        );
        console.log('✅ Recreated unique index');
      } catch (e) {
        console.log(`❌ Could not recreate index: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Database connection closed');
  }
}

inspectDatabase();
