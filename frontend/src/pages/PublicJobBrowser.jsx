// Public job browser for testing (no authentication required)
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./PublicJobBrowser.css";

export default function PublicJobBrowser() {
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    console.log("🔄 Loading public jobs...");
    setErr("");
    setLoading(true);
    try {
      // Try to fetch from a public endpoint or mock data
      const mockJobs = [
        {
          _id: "1",
          title: "Mathematics Tutor Needed - Class 10",
          classLevel: "Secondary",
          subjects: ["Mathematics"],
          location: "Dhaka, Bangladesh",
          expectedPayment: 5000,
          description: "Looking for an experienced mathematics tutor for Class 10 student. Need help with algebra and geometry.",
          student: { name: "Test Student" }
        },
        {
          _id: "2", 
          title: "Physics and Chemistry - HSC Level",
          classLevel: "Higher Secondary",
          subjects: ["Physics", "Chemistry"],
          location: "Chittagong, Bangladesh", 
          expectedPayment: 8000,
          description: "HSC student needs help with Physics and Chemistry. Preparing for university admission.",
          student: { name: "Another Student" }
        }
      ];
      
      console.log("✅ Loaded mock jobs:", mockJobs);
      setJobs(mockJobs);
    } catch (e) {
      console.error("❌ Error loading jobs:", e);
      setErr("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="public-job-browser">
      <div className="page-header">
        <h1>Available Tuition Jobs</h1>
        <p>Browse available tuition opportunities (Public View)</p>
        <div className="auth-notice">
          <strong>Note:</strong> To apply for jobs, please <a href="/login/tutor">login as a tutor</a>
        </div>
      </div>

      {err && <div className="error-message">{err}</div>}

      <div className="jobs-grid">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Loading jobs...</p>
          </div>
        )}
        
        {!loading && jobs.map((job) => (
          <div key={job._id} className="job-card">
            <div className="job-header">
              <h3 className="job-title">{job.title}</h3>
              <div className="job-status">Open</div>
            </div>
            <div className="job-details">
              <div className="job-meta">
                <span className="job-subject">{job.subjects.join(", ")}</span>
                <span className="job-level">{job.classLevel}</span>
                <span className="job-location">{job.location}</span>
              </div>
              <div className="job-budget">
                Budget: ৳{job.expectedPayment}
              </div>
              <div className="job-description">{job.description}</div>
            </div>
            <div className="job-actions">
              <a href="/login/tutor" className="apply-btn">
                Login to Apply
              </a>
            </div>
          </div>
        ))}
        
        {!loading && !jobs.length && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}
