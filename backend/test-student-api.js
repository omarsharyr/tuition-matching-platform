// Test student applications API endpoint
import connectDB from "./config/db.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function testStudentApplicationsAPI() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('🧪 Testing Student Applications API...\n');
        
        // Get student user
        const student = await User.findOne({ email: 'stu@gmail.com' });
        if (!student) {
            console.log('❌ Student not found');
            process.exit(1);
        }
        
        // Generate JWT token for student
        const token = jwt.sign(
            { userId: student._id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1d' }
        );
        
        console.log(`✅ Generated token for ${student.name}`);
        
        // Make API call to student applications endpoint
        const response = await fetch('http://localhost:5000/api/student/applications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 API Response Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Success!');
            console.log(`📊 Applications count: ${data.applications?.length || 0}`);
            console.log(`📈 Status counts:`, data.counts);
            
            if (data.applications && data.applications.length > 0) {
                console.log('\n📋 Applications:');
                data.applications.forEach((app, index) => {
                    console.log(`${index + 1}. ${app.tutor?.name} -> "${app.post?.title}" (${app.status})`);
                });
            }
        } else {
            const errorText = await response.text();
            console.log('❌ API Error:');
            console.log('Status:', response.status);
            console.log('Error:', errorText);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testStudentApplicationsAPI();
