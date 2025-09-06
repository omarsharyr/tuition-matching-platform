import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function StudentPostDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [post, setPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [postRes, appsRes] = await Promise.all([
          api.get(`/student/posts/${id}`),
          api.get(`/student/posts/${id}/applications`)
        ]);
        setPost(postRes.data);
        setApplications(appsRes.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load post details.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAction = async (applicationId, action) => {
    setActionLoading(applicationId);
    try {
      await api.put(`/student/applications/${applicationId}/${action}`);
      // Refresh applications
      const res = await api.get(`/student/posts/${id}/applications`);
      setApplications(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || `Failed to ${action} application.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardFrame role="student" title="Loading...">
        <div className="skeleton" style={{ height: 200 }} />
      </DashboardFrame>
    );
  }

  if (error && !post) {
    return (
      <DashboardFrame role="student" title="Error">
        <div className="auth-error">{error}</div>
        <Link to="/student/dashboard" className="btn primary">Back to Dashboard</Link>
      </DashboardFrame>
    );
  }

  return (
    <DashboardFrame role="student" title={post?.title || "Job Post"}>
      {error && <div className="auth-error">{error}</div>}
      
      <div style={{ marginBottom: '16px' }}>
        <Link to="/student/dashboard" className="btn ghost">← Back to Dashboard</Link>
      </div>

      {/* Post Details */}
      <div className="panel">
        <h2 className="panel-title">Job Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <p><strong>Title:</strong> {post?.title}</p>
            <p><strong>Subject:</strong> {post?.subject}</p>
            <p><strong>Level:</strong> {post?.level}</p>
            <p><strong>Location:</strong> {post?.location}</p>
          </div>
          <div>
            <p><strong>Budget:</strong> {
              post?.budgetAmount ? `৳${post.budgetAmount}` : 
              (post?.budget && typeof post.budget === 'object' && post.budget.min && post.budget.max) ? 
              `৳${post.budget.min} - ৳${post.budget.max}` : 
              post?.budget ? `৳${post.budget}` : 'Not specified'
            }</p>
            <p><strong>Duration:</strong> {post?.duration || 'Not specified'}</p>
            <p><strong>Schedule:</strong> {post?.schedule || 'Not specified'}</p>
            <p><strong>Status:</strong> 
              <span className={`badge ${post?.status === "open" ? "green" : post?.status === "fulfilled" ? "blue" : ""}`} style={{ marginLeft: '8px' }}>
                {post?.status}
              </span>
            </p>
          </div>
        </div>
        
        {post?.description && (
          <div style={{ marginBottom: '12px' }}>
            <p><strong>Description:</strong></p>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>{post.description}</p>
          </div>
        )}
        
        {post?.requirements && (
          <div>
            <p><strong>Requirements:</strong></p>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>{post.requirements}</p>
          </div>
        )}
      </div>

      {/* Applications */}
      <div className="panel">
        <h2 className="panel-title">Applications ({applications.length})</h2>
        
        {applications.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No applications received yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {applications.map((app) => (
              <div key={app._id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '16px',
                background: app.status === 'shortlisted' ? '#f0f9ff' : app.status === 'accepted' ? '#f0fdf4' : '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                      {app.tutor?.name || 'Anonymous Tutor'}
                    </h4>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                      {app.tutor?.email} • Submitted {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${
                    app.status === 'pending' ? '' : 
                    app.status === 'shortlisted' ? 'blue' : 
                    app.status === 'accepted' ? 'green' : 'red'
                  }`}>
                    {app.status}
                  </span>
                </div>
                
                {app.coverLetter && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>Cover Letter:</p>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(app._id, 'shortlist')}
                        disabled={actionLoading === app._id}
                        className="btn primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {actionLoading === app._id ? 'Processing...' : 'Shortlist'}
                      </button>
                      <button
                        onClick={() => handleAction(app._id, 'reject')}
                        disabled={actionLoading === app._id}
                        className="btn danger"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {app.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => handleAction(app._id, 'accept')}
                        disabled={actionLoading === app._id}
                        className="btn primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {actionLoading === app._id ? 'Processing...' : 'Accept & Hire'}
                      </button>
                      <Link
                        to={`/chat/${app.chatRoom}`}
                        className="btn ghost"
                        style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                      >
                        Message
                      </Link>
                    </>
                  )}
                  
                  {app.status === 'accepted' && (
                    <Link
                      to={`/chat/${app.chatRoom}`}
                      className="btn primary"
                      style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                    >
                      Chat
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardFrame>
  );
}
