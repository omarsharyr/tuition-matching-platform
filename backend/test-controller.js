import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { getAllApplications } from './controllers/studentController.js';

dotenv.config();

const testGetAllApplications = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('✅ Connected to database');

        // Mock request and response objects
        const req = {
            user: {
                _id: '68baf97b3f42576f34896499', // stu@gmail.com user ID (note: _id not id)
                id: '68baf97b3f42576f34896499',
                role: 'student'
            },
            query: {}
        };

        console.log('👤 Testing with user ID:', req.user.id);

        const res = {
            json: (data) => {
                console.log('📊 Controller response:', JSON.stringify(data, null, 2));
                return res;
            },
            status: (code) => {
                console.log(`📡 Response status: ${code}`);
                return res;
            }
        };

        console.log('🔍 Testing getAllApplications controller...');
        await getAllApplications(req, res);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

testGetAllApplications();
