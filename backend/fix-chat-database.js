// Fix chat collection duplicate key error
import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixChatConflicts() {
  try {
    console.log('🔧 Starting chat collection database fix...\n');

    // Connect to database if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Step 1: Analyze current chat documents
    console.log('📊 Analyzing current chat documents...');
    const allChats = await Chat.find({});
    console.log(`   Found ${allChats.length} chat documents in database`);

    // Find chats with null postId
    const nullPostIdChats = await Chat.find({ postId: null });
    console.log(`   Found ${nullPostIdChats.length} chats with null postId`);

    if (nullPostIdChats.length > 0) {
      console.log('📋 Chats with null postId:');
      nullPostIdChats.forEach((chat, index) => {
        console.log(`   ${index + 1}. Chat ID: ${chat._id}`);
        console.log(`      Participants: ${chat.participants?.length || 0}`);
        console.log(`      Messages: ${chat.messages?.length || 0}`);
        console.log(`      Created: ${chat.createdAt || 'N/A'}`);
      });

      // Remove chats with null postId (they're corrupted)
      console.log('\n🗑️ Removing corrupted chats with null postId...');
      const deleteResult = await Chat.deleteMany({ postId: null });
      console.log(`   Deleted ${deleteResult.deletedCount} corrupted chat documents`);
    }

    // Step 2: Find any other duplicate postId values
    console.log('\n🔍 Checking for other duplicate postId values...');
    const duplicates = await Chat.aggregate([
      { $group: { 
          _id: '$postId', 
          count: { $sum: 1 }, 
          docs: { $push: { id: '$_id', createdAt: '$createdAt' } }
      }},
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log(`   Found ${duplicates.length} postId values with duplicates`);
      
      for (const dup of duplicates) {
        console.log(`   PostId ${dup._id} has ${dup.count} chats`);
        
        // Keep the oldest chat, remove the rest
        const sortedDocs = dup.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const toKeep = sortedDocs[0];
        const toDelete = sortedDocs.slice(1);
        
        console.log(`     Keeping: ${toKeep.id} (${toKeep.createdAt})`);
        for (const doc of toDelete) {
          console.log(`     Deleting: ${doc.id} (${doc.createdAt})`);
          await Chat.findByIdAndDelete(doc.id);
        }
      }
    } else {
      console.log('   No duplicate postId values found');
    }

    // Step 3: Drop and recreate the unique index on postId
    console.log('\n🔧 Rebuilding postId unique index...');
    try {
      await Chat.collection.dropIndex('postId_1');
      console.log('   Dropped existing postId unique index');
    } catch (e) {
      console.log('   No existing postId unique index to drop');
    }

    try {
      // Create unique index, but allow null values (sparse index)
      await Chat.collection.createIndex(
        { postId: 1 }, 
        { 
          unique: true, 
          sparse: true,  // This allows multiple null values
          name: 'postId_1' 
        }
      );
      console.log('✅ Created new sparse unique index on postId');
    } catch (e) {
      console.log('❌ Could not create unique index:', e.message);
    }

    // Step 4: Validate the fix
    console.log('\n✅ Validating chat collection...');
    const finalChats = await Chat.find({});
    console.log(`   Final chat count: ${finalChats.length}`);
    
    const finalNullChats = await Chat.find({ postId: null });
    console.log(`   Chats with null postId: ${finalNullChats.length}`);

    // Show indexes
    console.log('\n📋 Current chat collection indexes:');
    const indexes = await Chat.collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) console.log(`     (UNIQUE${index.sparse ? ', SPARSE' : ''})`);
    });

    console.log('\n🎉 Chat collection fix completed successfully!');
    console.log('💡 The findAndModify operation should now work without E11000 errors');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Chat collection fix failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the fix
fixChatConflicts();
