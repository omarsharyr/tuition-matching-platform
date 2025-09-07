import React, { useState } from 'react';
import './DocumentViewer.css';

const DocumentViewer = ({ document, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const getDocumentUrl = (doc) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${doc.url}`;
  };

  const getDocumentType = (doc) => {
    if (doc.mimetype) {
      if (doc.mimetype.startsWith('image/')) return 'image';
      if (doc.mimetype === 'application/pdf') return 'pdf';
    }
    
    const extension = doc.filename?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    
    return 'other';
  };

  const handleDownload = () => {
    const url = getDocumentUrl(document);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInNewTab = () => {
    const url = getDocumentUrl(document);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const docType = getDocumentType(document);
  const docUrl = getDocumentUrl(document);

  return (
    <div className="document-viewer-overlay" onClick={onClose}>
      <div className="document-viewer-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="document-viewer-header">
          <div className="document-info">
            <h3>{document.filename || 'Document'}</h3>
            <div className="document-meta">
              <span className="doc-type-badge">
                {document.type === 'STUDENT_ID' ? 'Student ID' : 
                 document.type === 'EDU_DOC' ? 'Education Certificate' : 
                 document.type === 'PARENT_NID' ? 'Parent NID' : 
                 document.type || 'Document'}
              </span>
              {document.size && (
                <span className="doc-size">
                  {(document.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
          
          <div className="document-actions">
            <button className="action-btn download-btn" onClick={handleDownload} title="Download">
              📥 Download
            </button>
            <button className="action-btn external-btn" onClick={handleViewInNewTab} title="Open in new tab">
              🔗 New Tab
            </button>
            <button className="action-btn close-btn" onClick={onClose} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="document-viewer-content">
          {loading && (
            <div className="viewer-loading">
              <div className="loading-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          
          {error && (
            <div className="viewer-error">
              <div className="error-icon">⚠️</div>
              <h4>Cannot display document</h4>
              <p>{error}</p>
              <div className="error-actions">
                <button className="retry-btn" onClick={() => window.location.reload()}>
                  🔄 Retry
                </button>
                <button className="download-fallback-btn" onClick={handleDownload}>
                  📥 Download Instead
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {docType === 'image' && (
                <div className="image-viewer">
                  <img 
                    src={docUrl} 
                    alt={document.filename}
                    onLoad={() => setLoading(false)}
                    onError={(e) => {
                      setError('Failed to load image. The file may be missing or corrupted.');
                      setLoading(false);
                    }}
                  />
                </div>
              )}

              {docType === 'pdf' && (
                <div className="pdf-viewer">
                  <iframe
                    src={`${docUrl}#view=FitH`}
                    title={document.filename}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setError('Failed to load PDF. Your browser may not support PDF viewing.');
                      setLoading(false);
                    }}
                  />
                  <div className="pdf-fallback">
                    <p>📄 PDF Document</p>
                    <button className="view-external-btn" onClick={handleViewInNewTab}>
                      Open in Browser
                    </button>
                  </div>
                </div>
              )}

              {docType === 'other' && (
                <div className="unsupported-viewer">
                  <div className="file-icon">📎</div>
                  <h4>{document.filename}</h4>
                  <p>This file type cannot be previewed in the browser.</p>
                  <div className="fallback-actions">
                    <button className="download-btn-large" onClick={handleDownload}>
                      📥 Download File
                    </button>
                    <button className="external-btn-large" onClick={handleViewInNewTab}>
                      🔗 Open in New Tab
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
