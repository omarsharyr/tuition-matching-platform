// Test the API call that the frontend makes
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function testTutorJobsAPI() {
  try {
    console.log("🧪 Testing /api/tutor/jobs endpoint...\n");
    
    // Test without authentication first
    try {
      const response = await axios.get("http://localhost:5000/api/tutor/jobs");
      console.log("✅ Response (no auth):", response.status, response.data);
    } catch (error) {
      console.log("❌ Error (no auth):", error.response?.status, error.response?.data || error.message);
    }

    // The endpoint requires authentication, so this is expected to fail
    console.log("\n📝 This endpoint requires:");
    console.log("1. User to be logged in");
    console.log("2. User role to be 'tutor'");
    console.log("3. User to be verified");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testTutorJobsAPI();
