// frontend/src/components/PostWizard/Step6Review.jsx
import React from 'react';

const Step6Review = ({ formData, onSubmit, loading }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  const getPublicInfo = () => ({
    title: formData.title,
    educationLevel: formData.educationLevel,
    subjects: formData.subjects,
    syllabus: formData.syllabus,
    description: formData.description,
    area: formData.area,
    teachingMode: formData.teachingMode,
    daysPerWeek: formData.daysPerWeek,
    preferredDays: formData.preferredDays,
    preferredTimes: formData.preferredTimes,
    startDate: formData.startDate,
    duration: formData.duration,
    paymentType: formData.paymentType,
    budgetAmount: formData.budgetAmount,
    paymentNotes: formData.paymentNotes,
    preferredGender: formData.preferredGender,
    experience: formData.experience,
    universityPreference: formData.universityPreference,
    otherPreferences: formData.otherPreferences
  });

  const getPrivateInfo = () => ({
    exactAddress: formData.exactAddress,
    // Phone and documents would be from user profile
    phoneNumber: 'From your profile',
    documents: 'ID verification from profile'
  });

  const DAYS_MAP = {
    saturday: 'Sat', sunday: 'Sun', monday: 'Mon', tuesday: 'Tue',
    wednesday: 'Wed', thursday: 'Thu', friday: 'Fri'
  };

  const TIMES_MAP = {
    morning: 'Morning (6 AM-12 PM)',
    afternoon: 'Afternoon (12 PM-5 PM)', 
    evening: 'Evening (5 PM-9 PM)',
    night: 'Night (9 PM-11 PM)'
  };

  const TEACHING_MODES = {
    student_home: "Student's Home",
    tutor_place: "Tutor's Place", 
    online: 'Online',
    hybrid: 'Hybrid'
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Review & Publish</h3>
        <p>Review your tuition post before publishing</p>
      </div>

      <div className="step-content">
        {/* Summary Cards */}
        <div className="review-sections">
          
          {/* Basic Information */}
          <div className="review-section">
            <h4 className="section-title">
              <span className="section-icon">📚</span>
              Basic Information
            </h4>
            <div className="review-card">
              <div className="card-row">
                <span className="row-label">Title:</span>
                <span className="row-value">{formData.title}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Education Level:</span>
                <span className="row-value">{formData.educationLevel}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Subjects:</span>
                <span className="row-value">
                  <div className="subjects-list">
                    {formData.subjects?.map(subject => (
                      <span key={subject} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </span>
              </div>
              {formData.syllabus && (
                <div className="card-row">
                  <span className="row-label">Syllabus:</span>
                  <span className="row-value">{formData.syllabus}</span>
                </div>
              )}
              {formData.description && (
                <div className="card-row">
                  <span className="row-label">Description:</span>
                  <span className="row-value">{formData.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Teaching Mode */}
          <div className="review-section">
            <h4 className="section-title">
              <span className="section-icon">📍</span>
              Location & Teaching
            </h4>
            <div className="review-card">
              <div className="card-row">
                <span className="row-label">Area:</span>
                <span className="row-value">{formData.area}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Teaching Mode:</span>
                <span className="row-value">{TEACHING_MODES[formData.teachingMode]}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="review-section">
            <h4 className="section-title">
              <span className="section-icon">📅</span>
              Schedule
            </h4>
            <div className="review-card">
              <div className="card-row">
                <span className="row-label">Frequency:</span>
                <span className="row-value">
                  {formData.daysPerWeek} {formData.daysPerWeek === 1 ? 'day' : 'days'} per week
                </span>
              </div>
              <div className="card-row">
                <span className="row-label">Preferred Days:</span>
                <span className="row-value">
                  {formData.preferredDays?.map(day => DAYS_MAP[day]).join(', ')}
                </span>
              </div>
              <div className="card-row">
                <span className="row-label">Preferred Times:</span>
                <span className="row-value">
                  {formData.preferredTimes?.map(time => TIMES_MAP[time]).join(', ')}
                </span>
              </div>
              {formData.startDate && (
                <div className="card-row">
                  <span className="row-label">Start Date:</span>
                  <span className="row-value">
                    {new Date(formData.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {formData.duration && (
                <div className="card-row">
                  <span className="row-label">Duration:</span>
                  <span className="row-value">{formData.duration} weeks</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="review-section">
            <h4 className="section-title">
              <span className="section-icon">💰</span>
              Budget & Payment
            </h4>
            <div className="review-card">
              <div className="card-row">
                <span className="row-label">Payment Type:</span>
                <span className="row-value">{formData.paymentType}</span>
              </div>
              <div className="card-row">
                <span className="row-label">Budget:</span>
                <span className="row-value budget-amount">
                  {formatCurrency(formData.budgetAmount)} per {formData.paymentType}
                </span>
              </div>
              {formData.paymentNotes && (
                <div className="card-row">
                  <span className="row-label">Notes:</span>
                  <span className="row-value">{formData.paymentNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tutor Preferences */}
          {(formData.preferredGender !== 'any' || formData.experience !== 'any' || 
            formData.universityPreference?.length > 0 || formData.otherPreferences) && (
            <div className="review-section">
              <h4 className="section-title">
                <span className="section-icon">👥</span>
                Tutor Preferences
              </h4>
              <div className="review-card">
                {formData.preferredGender !== 'any' && (
                  <div className="card-row">
                    <span className="row-label">Gender:</span>
                    <span className="row-value">{formData.preferredGender}</span>
                  </div>
                )}
                {formData.experience !== 'any' && (
                  <div className="card-row">
                    <span className="row-label">Experience:</span>
                    <span className="row-value">{formData.experience} years</span>
                  </div>
                )}
                {formData.universityPreference?.length > 0 && (
                  <div className="card-row">
                    <span className="row-label">Universities:</span>
                    <span className="row-value">
                      <div className="universities-list">
                        {formData.universityPreference.map(uni => (
                          <span key={uni} className="university-tag">{uni}</span>
                        ))}
                      </div>
                    </span>
                  </div>
                )}
                {formData.otherPreferences && (
                  <div className="card-row">
                    <span className="row-label">Other:</span>
                    <span className="row-value">{formData.otherPreferences}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visibility Information */}
        <div className="visibility-section">
          <h4 className="visibility-title">
            <span className="visibility-icon">👁️</span>
            Visibility & Privacy
          </h4>
          
          <div className="visibility-cards">
            <div className="visibility-card public">
              <h5>🌍 Public Information</h5>
              <p>Visible to all tutors browsing posts</p>
              <ul>
                <li>Title, subjects, and education level</li>
                <li>Area (not exact address)</li>
                <li>Teaching mode and schedule preferences</li>
                <li>Budget and payment type</li>
                <li>Tutor preferences</li>
              </ul>
            </div>

            <div className="visibility-card private">
              <h5>🔒 Private Information</h5>
              <p>Only shared with accepted tutors</p>
              <ul>
                <li>Your exact address</li>
                <li>Phone number from profile</li>
                <li>ID verification documents</li>
                <li>Personal contact details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final Actions */}
        <div className="final-actions-section">
          <div className="actions-info">
            <h4>🚀 Ready to Publish?</h4>
            <p>Your post will be visible to tutors immediately after publishing. 
               You can edit or pause it anytime from your dashboard.</p>
          </div>

          <div className="action-buttons">
            <button
              className="btn-outline"
              onClick={() => onSubmit(true)}
              disabled={loading}
            >
              💾 Save Draft
            </button>
            <button
              className="btn-primary-large"
              onClick={() => onSubmit(false)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Publishing...
                </>
              ) : (
                <>
                  🎯 Publish Post
                </>
              )}
            </button>
          </div>

          <div className="publish-note">
            <div className="note-icon">💡</div>
            <div className="note-text">
              <strong>What happens next:</strong>
              <br />• Your post becomes visible to qualified tutors
              <br />• You'll receive notifications when tutors apply
              <br />• Review applications and shortlist your favorites
              <br />• Interview and select the perfect tutor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Review;
