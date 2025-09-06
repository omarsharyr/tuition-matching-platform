import React, { useState, useEffect } from "react";

export default function DirectJobBoard() {
  const [authState, setAuthState] = useState({});
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Check auth state
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
      console.error("Error parsing user:", e);
    }

    setAuthState({ token: !!token, user });

    // Try to fetch jobs directly
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tutor/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("📋 Direct API response:", data);
        setJobs(data.posts || data || []);
      } catch (error) {
        console.error("❌ Direct API error:", error);
      }
    };

    if (token) {
      fetchJobs();
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Direct Job Board Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Authentication State:</h3>
        <p>Has Token: {authState.token ? "✅ Yes" : "❌ No"}</p>
        <p>User Email: {authState.user?.email || "None"}</p>
        <p>User Role: {authState.user?.role || "None"}</p>
      </div>

      <div>
        <h3>Jobs ({jobs.length}):</h3>
        {jobs.length === 0 ? (
          <p>No jobs found or loading...</p>
        ) : (
          <ul>
            {jobs.map((job, index) => (
              <li key={job._id || index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
                <h4>{job.title || "Untitled Job"}</h4>
                <p>Subject: {job.subjects && job.subjects.length > 0 ? job.subjects.join(', ') : 'Subject'}</p>
                <p>Location: {job.location}</p>
                <p>Salary: {job.salary}</p>
                <p>Status: {job.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => window.location.href = "/tutor/jobs"}>
          Try to Navigate to /tutor/jobs
        </button>
      </div>
    </div>
  );
}
