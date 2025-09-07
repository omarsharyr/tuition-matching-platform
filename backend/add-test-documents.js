// Test script to add sample documents for testing
import mongoose from 'mongoose';
import Document from './models/Document.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const addTestDocuments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find users with pending verification
    const users = await User.find({ verificationStatus: 'pending' });
    
    if (users.length === 0) {
      console.log('No pending users found. Creating a test user...');
      
      const testUser = await User.create({
        name: 'Test Student',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'hashedpassword123',
        role: 'student',
        isVerified: false,
        verificationStatus: 'pending',
        status: 'ACTIVE'
      });
      
      users.push(testUser);
    }

    // Create test documents for the first user
    const user = users[0];
    console.log(`Adding test documents for user: ${user.name} (${user.email})`);

    // Check if this user already has documents
    const existingDocs = await Document.find({ userId: user._id });
    if (existingDocs.length > 0) {
      console.log(`User already has ${existingDocs.length} documents`);
      existingDocs.forEach(doc => {
        console.log(`- ${doc.type}: ${doc.filename} (${doc.url})`);
      });
      return;
    }

    // Create sample documents
    const sampleDocs = [
      {
        userId: user._id,
        type: 'STUDENT_ID',
        url: '/uploads/test-document.txt',
        filename: 'student-id-card.txt',
        mimetype: 'text/plain',
        size: 49
      },
      {
        userId: user._id,
        type: 'EDU_DOC',
        url: '/uploads/test-document.txt',
        filename: 'education-certificate.txt',
        mimetype: 'text/plain',
        size: 49
      }
    ];

    if (user.role === 'student') {
      sampleDocs.push({
        userId: user._id,
        type: 'PARENT_NID',
        url: '/uploads/test-document.txt',
        filename: 'parent-nid.txt',
        mimetype: 'text/plain',
        size: 49
      });
    }

    // Insert the documents
    const createdDocs = await Document.insertMany(sampleDocs);
    console.log(`Created ${createdDocs.length} test documents`);
    
    createdDocs.forEach(doc => {
      console.log(`- ${doc.type}: ${doc.filename}`);
    });

    console.log('Test documents added successfully!');
    
  } catch (error) {
    console.error('Error adding test documents:', error);
  } finally {
    await mongoose.connection.close();
  }
};

addTestDocuments();
