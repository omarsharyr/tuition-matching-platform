import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const getUserId = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'stu@gmail.com' });
        if (user) {
            console.log('User ID:', user._id.toString());
            console.log('User role:', user.role);
            console.log('User status:', user.status);
        } else {
            console.log('User not found');
        }
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

getUserId();
