import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "../styles/DashboardLayout.css";

export default function VerificationStatus({ compact = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationInfo, setVerificationInfo] = useState(null);

  useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const response = await api.get("/auth/verification-status");
        setVerificationInfo(response.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load verification status.");
      } finally {
        setLoading(false);
      }
    };

    loadVerificationStatus();
  }, []);

  if (loading) {
    return (
      <div className="panel">
        <div className="skeleton" style={{ height: compact ? 60 : 120 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  const { verificationStatus, verificationReason, documents = [] } = verificationInfo || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": return "#059669";
      case "rejected": return "#dc2626";
      case "pending": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified": return "✅";
      case "rejected": return "❌";
      case "pending": return "⏳";
      default: return "📄";
    }
  };

  if (compact) {
    return (
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>
            {getStatusIcon(verificationStatus)}
          </span>
          <div>
            <h4 style={{ margin: '0', fontSize: '14px', fontWeight: '600' }}>
              Account Verification
            </h4>
            <p style={{ 
              margin: '0', 
              fontSize: '13px', 
              color: getStatusColor(verificationStatus),
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {verificationStatus || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Verification Status</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>
            {getStatusIcon(verificationStatus)}
          </span>
          <div>
            <h3 style={{ 
              margin: '0', 
              fontSize: '18px', 
              color: getStatusColor(verificationStatus),
              textTransform: 'capitalize'
            }}>
              {verificationStatus || 'Unknown'}
            </h3>
          </div>
        </div>
        
        {verificationReason && (
          <div style={{ 
            padding: '12px', 
            background: verificationStatus === 'rejected' ? '#fef2f2' : '#fff7ed',
            border: `1px solid ${verificationStatus === 'rejected' ? '#fecaca' : '#fed7aa'}`,
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: verificationStatus === 'rejected' ? '#991b1b' : '#92400e'
            }}>
              <strong>Admin Message:</strong> {verificationReason}
            </p>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Submitted Documents</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {documents.map((doc, index) => (
              <div key={doc._id || index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fff'
              }}>
                <div>
                  <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>
                    {doc.type === 'studentId' ? 'Student ID' : 
                     doc.type === 'educationDocument' ? 'Education Certificate' : 
                     doc.type || 'Document'}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${
                    doc.status === 'approved' ? 'green' : 
                    doc.status === 'rejected' ? '' : 
                    'blue'
                  }`}>
                    {doc.status || 'pending'}
                  </span>
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn ghost"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
            <strong>Next Steps:</strong> Your documents are being reviewed by our admin team. 
            You'll receive an email notification once the verification is complete. 
            Typically takes 1-3 business days.
          </p>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#991b1b' }}>
            <strong>Verification Rejected:</strong> Please review the admin message above 
            and contact support if you need to resubmit documents.
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#991b1b' }}>
            Support Email: admin@tuitionplatform.com
          </p>
        </div>
      )}
    </div>
  );
}
