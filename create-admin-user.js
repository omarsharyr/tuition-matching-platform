// Create admin user directly in database
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './backend/models/User.js';

mongoose.connect('mongodb://localhost:27017/tuition-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', {
        id: existingAdmin._id,
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role,
        isVerified: existingAdmin.isVerified
      });
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      verificationStatus: 'verified',
      meta: {
        createdBy: 'system',
        createdAt: new Date()
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully:', {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();
