import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './JobBrowser.css';

const JobBrowser = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    classLevel: '',
    subject: '',
    location: '',
    minPay: '',
    maxPay: '',
    mode: '',
    medium: '',
    preferredGender: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const classLevels = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'HSC 1st Year', 'HSC 2nd Year', 'University'
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Bangla', 'ICT', 'Economics', 'Accounting', 'Finance',
    'History', 'Geography', 'Civics', 'Statistics', 'Psychology'
  ];

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      });

      const response = await api.get(`/tutor/jobs?${queryParams}`);
      const { posts, pagination: paginationData } = response.data;
      
      setJobs(posts || []);
      setPagination(paginationData || { current: 1, pages: 1, total: 0 });
      console.log('✅ Jobs fetched:', posts?.length || 0, 'jobs');
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchJobs(1);
  };

  const handleClearFilters = () => {
    setFilters({
      classLevel: '',
      subject: '',
      location: '',
      minPay: '',
      maxPay: '',
      mode: '',
      medium: '',
      preferredGender: ''
    });
    setTimeout(() => fetchJobs(1), 100);
  };

  const handleApply = async (jobId) => {
    try {
      await api.post(`/tutor/jobs/${jobId}/apply`);
      console.log('✅ Applied successfully');
      // Refresh jobs to update application status
      fetchJobs(pagination.current);
    } catch (error) {
      console.error('❌ Error applying:', error);
      alert(error.response?.data?.message || 'Failed to apply for this job');
    }
  };

  const formatBudget = (budget) => {
    if (budget?.min && budget?.max) {
      return `৳${budget.min} - ৳${budget.max}/month`;
    }
    return 'Budget not specified';
  };

  const getStatusBadge = (applicationStatus) => {
    if (!applicationStatus) return null;
    
    const statusConfig = {
      applied: { class: 'status-applied', text: 'Applied' },
      shortlisted: { class: 'status-shortlisted', text: 'Shortlisted' },
      accepted: { class: 'status-accepted', text: 'Hired' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };

    const config = statusConfig[applicationStatus];
    if (!config) return null;

    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="job-browser">
      <div className="job-browser-header">
        <h2>Browse Available Jobs</h2>
        <p>Find tuition opportunities that match your expertise</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="classLevel">Class Level</label>
            <select
              id="classLevel"
              name="classLevel"
              value={filters.classLevel}
              onChange={handleFilterChange}
            >
              <option value="">Any Class</option>
              {classLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
            >
              <option value="">Any Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter area/city"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="mode">Mode</label>
            <select
              id="mode"
              name="mode"
              value={filters.mode}
              onChange={handleFilterChange}
            >
              <option value="">Any Mode</option>
              <option value="home">At Student's Home</option>
              <option value="tutor">At Tutor's Place</option>
              <option value="online">Online</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="minPay">Min Budget (৳)</label>
            <input
              type="number"
              id="minPay"
              name="minPay"
              placeholder="5000"
              value={filters.minPay}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPay">Max Budget (৳)</label>
            <input
              type="number"
              id="maxPay"
              name="maxPay"
              placeholder="15000"
              value={filters.maxPay}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={handleClearFilters}>
            Clear Filters
          </button>
          <button className="btn btn-primary" onClick={handleSearch}>
            Search Jobs
          </button>
        </div>
      </div>

      {/* Job Results */}
      <div className="job-results">
        <div className="results-header">
          <h3>
            {loading ? 'Loading...' : `${pagination.total} jobs found`}
          </h3>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="job-card loading-skeleton"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <div className="no-jobs-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h4 className="job-title">{job.title}</h4>
                  {getStatusBadge(job.applicationStatus)}
                </div>

                <div className="job-meta">
                  <div className="job-meta-item">
                    <span className="meta-label">Class:</span>
                    <span className="meta-value">{job.classLevel}</span>
                  </div>
                  <div className="job-meta-item">
                    <span className="meta-label">Subjects:</span>
                    <span className="meta-value">
                      {job.subjects?.slice(0, 2).join(', ')}
                      {job.subjects?.length > 2 && ` +${job.subjects.length - 2} more`}
                    </span>
                  </div>
                  <div className="job-meta-item">
                    <span className="meta-label">Location:</span>
                    <span className="meta-value">{job.location}</span>
                  </div>
                  <div className="job-meta-item">
                    <span className="meta-label">Mode:</span>
                    <span className="meta-value">{job.mode || 'home'}</span>
                  </div>
                </div>

                <div className="job-budget">
                  {formatBudget(job.budget)}
                </div>

                <div className="job-schedule">
                  <div className="schedule-item">
                    <span className="schedule-label">Days:</span>
                    <span className="schedule-value">
                      {job.days?.slice(0, 3).join(', ')}
                      {job.days?.length > 3 && ` +${job.days.length - 3}`}
                    </span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-label">Time:</span>
                    <span className="schedule-value">
                      {job.timeSlots?.length > 0 ? `${job.timeSlots.length} slot(s)` : 'Flexible'}
                    </span>
                  </div>
                </div>

                <div className="job-footer">
                  <small className="job-posted">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </small>
                  
                  {job.applicationStatus ? (
                    <button className="btn btn-applied" disabled>
                      {getStatusBadge(job.applicationStatus)?.props.children}
                    </button>
                  ) : (
                    <button 
                      className="btn btn-apply"
                      onClick={() => handleApply(job._id)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={pagination.current === 1}
              onClick={() => fetchJobs(pagination.current - 1)}
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {pagination.current} of {pagination.pages}
            </span>
            
            <button
              className="btn btn-secondary"
              disabled={pagination.current === pagination.pages}
              onClick={() => fetchJobs(pagination.current + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBrowser;
