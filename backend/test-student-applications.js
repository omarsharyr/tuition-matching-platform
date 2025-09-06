import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Application from './models/Application.js';
import TuitionPost from './models/TuitionPost.js';

dotenv.config();

const testStudentApplications = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('✅ Database connected');

        // Find the student user (stu@gmail.com)
        const student = await User.findOne({ email: 'stu@gmail.com' });
        if (!student) {
            console.log('❌ Student not found');
            return;
        }

        console.log(`📧 Testing with student: ${student.email}`);

        // Generate a token for the student
        const token = jwt.sign(
            { id: student._id, email: student.email, role: student.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        console.log('🔑 Generated token for student');

        // Test the getAllApplications logic directly
        console.log('\n🔍 Testing getAllApplications logic...');

        // Get all tuition posts created by this student
        const posts = await TuitionPost.find({ student: student._id });
        console.log(`📝 Student has ${posts.length} tuition posts`);

        if (posts.length === 0) {
            console.log('❌ No posts found for student');
            return;
        }

        const postIds = posts.map(post => post._id);
        console.log('📋 Post IDs:', postIds);

        // Get all applications for these posts
        const applications = await Application.find({ post: { $in: postIds } })
            .populate('tutor', 'name email profilePicture')
            .populate('post', 'title subject location budget status')
            .sort({ createdAt: -1 });

        console.log(`📋 Found ${applications.length} applications`);

        if (applications.length > 0) {
            applications.forEach((app, index) => {
                console.log(`\n📋 Application ${index + 1}:`);
                console.log(`  - ID: ${app._id}`);
                console.log(`  - Status: ${app.status}`);
                console.log(`  - Tutor: ${app.tutor?.name} (${app.tutor?.email})`);
                console.log(`  - Post: ${app.post?.title}`);
                console.log(`  - Created: ${app.createdAt}`);
            });

            // Group applications by status
            const statusSummary = applications.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
            }, {});

            console.log('\n📊 Status Summary:', statusSummary);
        } else {
            console.log('❌ No applications found');
            
            // Check if there are any applications at all
            const allApps = await Application.find();
            console.log(`📋 Total applications in database: ${allApps.length}`);
            
            if (allApps.length > 0) {
                console.log('🔍 All applications:');
                allApps.forEach(app => {
                    console.log(`  - ${app._id}: post ${app.post} by tutor ${app.tutor} - status: ${app.status}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

testStudentApplications();
