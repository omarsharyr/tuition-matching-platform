import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import TutorSidebar from "../../components/TutorSidebar";
import useSidebar from "../../hooks/useSidebar";
import "./TutorJobBoard.css";

export default function TutorJobBoard() {
  console.log("🏗️ TutorJobBoard component mounted");
  console.log("🔍 Current URL:", window.location.href);
  console.log("🔍 Current pathname:", window.location.pathname);
  
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(true);
  const [filters, setFilters] = useState({
    classLevel: "",
    subject: "",
    location: "",
    minPay: "",
    maxPay: "",
  });
  const [jobs, setJobs] = useState([]); // Initialize as empty array
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set()); // Track applied job IDs
  const [successMessage, setSuccessMessage] = useState(""); // Success feedback

  const load = async () => {
    console.log("🔄 Loading jobs...");
    setErr("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const url = `/tutor/jobs?${params.toString()}`;
      console.log("🌐 API call:", url);
      const { data } = await api.get(url);
      console.log("✅ API response:", data);
      // Handle the correct API response format: { posts: [...], pagination: {...} }
      const jobsData = data.posts || data || [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      
      // Populate applied jobs from backend data
      const appliedJobIds = new Set();
      jobsArray.forEach(job => {
        console.log(`Job ${job._id}: applicationStatus = ${job.applicationStatus}`);
        if (job.applicationStatus) {
          appliedJobIds.add(job._id);
          console.log(`✅ Added job ${job._id} to appliedJobs (status: ${job.applicationStatus})`);
        }
      });
      setAppliedJobs(appliedJobIds);
      console.log(`📋 Total applied jobs: ${appliedJobIds.size}`);
      
    } catch (e) {
      console.error("❌ API error:", e);
      setErr(e?.response?.data?.message || "Failed to load jobs");
      setJobs([]); // Set to empty array on error
      setAppliedJobs(new Set()); // Reset applied jobs on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const apply = async (postId) => {
    try {
      console.log(`🎯 Attempting to apply to job: ${postId}`);
      console.log(`🔍 Current appliedJobs:`, Array.from(appliedJobs));
      console.log(`⚡ Is job already applied?`, appliedJobs.has(postId));
      
      setLoading(true);
      setErr(""); // Clear any previous errors
      setSuccessMessage(""); // Clear any previous success messages
      
      await api.post(`/tutor/jobs/${postId}/apply`, { message: "" });
      
      // Add job to applied set immediately for UI feedback
      setAppliedJobs(prev => new Set([...prev, postId]));
      console.log(`✅ Successfully applied to job: ${postId}`);
      
      // Show success feedback
      setSuccessMessage("Application submitted successfully! The student will be notified.");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
      
      // Refresh jobs to get updated data from backend
      load();
    } catch (e) {
      console.error("❌ Apply error:", e);
      console.error("❌ Error response:", e?.response?.data);
      setErr(e?.response?.data?.message || "Failed to apply to this job");
      setSuccessMessage(""); // Clear success message on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-job-board-container">
      <TutorSidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={closeSidebar}
        />
      )}
      
      <div className={`tutor-job-board-main ${isCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Job Board</h1>
          <p>Browse and apply for tuition opportunities</p>
        </div>

        <div className="filters-section">
          <div className="filters-grid">
            <input
              className="filter-input"
              placeholder="Class Level"
              name="classLevel"
              value={filters.classLevel}
              onChange={onChange}
            />
            <input
              className="filter-input"
              placeholder="Subject"
              name="subject"
              value={filters.subject}
              onChange={onChange}
            />
            <input
              className="filter-input"
              placeholder="Location"
              name="location"
              value={filters.location}
              onChange={onChange}
            />
            <input
              className="filter-input"
              placeholder="Min Pay"
              name="minPay"
              value={filters.minPay}
              onChange={onChange}
            />
            <input
              className="filter-input"
              placeholder="Max Pay"
              name="maxPay"
              value={filters.maxPay}
              onChange={onChange}
            />
          </div>
          <button className="search-btn" onClick={load} disabled={loading}>
            {loading ? "Searching..." : "Search Jobs"}
          </button>
        </div>

        {err && <div className="error-message">{err}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="jobs-grid">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Loading jobs...</p>
            </div>
          )}
          {!loading && jobs.map((job) => (
            <div key={job._id} className="job-card">
              {/* Card Header */}
              <div className="card-header">
                <div className="header-left">
                  <div className="subject-badge">
                    <i className="fas fa-graduation-cap"></i>
                    <span>{job.subjects && job.subjects.length > 0 ? job.subjects.join(', ') : 'Subject'}</span>
                  </div>
                  <h2 className="job-title">{job.title || `${job.subjects && job.subjects.length > 0 ? job.subjects.join(', ') : 'Subject'} Tuition for ${job.classLevel}`}</h2>
                </div>
                <div className="header-right">
                  <div className="salary-highlight">
                    <span className="currency">৳</span>
                    <span className="amount">{job.budgetAmount || job.expectedPayment || job.salary || 'Nego'}</span>
                    <span className="period">/mon</span>
                  </div>
                  <div className={`status-indicator ${job.status?.toLowerCase() || 'open'}`}>
                    <div className="status-dot"></div>
                    {job.status || 'Open'}
                  </div>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="quick-info-bar">
                <div className="info-pill">
                  <i className="fas fa-book"></i>
                  <span>{job.subjects && job.subjects.length > 0 ? job.subjects.join(', ') : 'Subject'}</span>
                </div>
                <div className="info-pill">
                  <i className="fas fa-user-graduate"></i>
                  <span>{job.educationLevel || job.classLevel || 'Any Level'}</span>
                </div>
                {job.syllabus && (
                  <div className="info-pill version">
                    <i className="fas fa-language"></i>
                    <span>{job.syllabus}</span>
                  </div>
                )}
                <div className="info-pill">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{job.location || 'Location TBD'}</span>
                </div>
                <div className="info-pill">
                  <i className="fas fa-calendar-week"></i>
                  <span>{job.daysPerWeek ? `${job.daysPerWeek} days/week` : job.frequency || '3 days/week'}</span>
                </div>
                <div className="info-pill">
                  <i className="fas fa-clock"></i>
                  <span>{new Date(job.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  }) || 'Recent'}</span>
                </div>
                {job.urgency && (
                  <div className="info-pill urgent">
                    <i className="fas fa-bolt"></i>
                    <span>Urgent</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="card-body">
                {/* Description */}
                <div className="job-description">
                  <p>{job.description || 'Looking for a qualified tutor to help with academic improvement and exam preparation.'}</p>
                </div>

                {/* Key Details Grid */}
                <div className="details-grid">
                  {job.schedule && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Schedule</span>
                        <span className="detail-value">{job.schedule}</span>
                      </div>
                    </div>
                  )}
                  
                  {job.duration && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-hourglass-half"></i>
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{job.duration}</span>
                      </div>
                    </div>
                  )}

                  {job.studentInfo?.grade && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Student Grade</span>
                        <span className="detail-value">{job.studentInfo.grade}</span>
                      </div>
                    </div>
                  )}

                  {job.requirements && (
                    <div className="detail-item full-width">
                      <div className="detail-icon">
                        <i className="fas fa-list-check"></i>
                      </div>
                      <div className="detail-content">
                        <span className="detail-label">Requirements</span>
                        <span className="detail-value">{job.requirements}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="card-footer">
                <div className="footer-center">
                  <button 
                    className={`apply-btn-minimal ${appliedJobs.has(job._id) ? 'applied' : ''}`}
                    onClick={() => !appliedJobs.has(job._id) && apply(job._id)}
                    disabled={loading || appliedJobs.has(job._id)}
                  >
                    {appliedJobs.has(job._id) ? (
                      <>
                        <i className="fas fa-check"></i>
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Apply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !jobs.length && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters to find opportunities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}