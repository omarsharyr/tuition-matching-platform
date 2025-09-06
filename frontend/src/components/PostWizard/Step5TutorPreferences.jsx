// frontend/src/components/PostWizard/Step5TutorPreferences.jsx
import React, { useState } from 'react';

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any Gender', icon: '👥', description: 'No gender preference' },
  { value: 'male', label: 'Male Tutor', icon: '👨‍🏫', description: 'Prefer male tutor' },
  { value: 'female', label: 'Female Tutor', icon: '👩‍🏫', description: 'Prefer female tutor' }
];

const EXPERIENCE_OPTIONS = [
  { value: 'any', label: 'Any Experience', description: 'Open to all experience levels' },
  { value: '0-1', label: '0-1 Years', description: 'Fresh graduates, new tutors' },
  { value: '1-3', label: '1-3 Years', description: 'Some tutoring experience' },
  { value: '3-5', label: '3-5 Years', description: 'Experienced tutors' },
  { value: '5+', label: '5+ Years', description: 'Very experienced tutors' }
];

const POPULAR_UNIVERSITIES = [
  'University of Dhaka (DU)',
  'Bangladesh University of Engineering and Technology (BUET)',
  'BRAC University',
  'North South University (NSU)',
  'American International University-Bangladesh (AIUB)',
  'Independent University, Bangladesh (IUB)',
  'East West University (EWU)',
  'United International University (UIU)',
  'Daffodil International University',
  'Southeast University',
  'Chittagong University of Engineering & Technology (CUET)',
  'Rajshahi University of Engineering & Technology (RUET)',
  'Jahangirnagar University',
  'Chittagong University',
  'Islamic University of Technology (IUT)'
];

const Step5TutorPreferences = ({ formData, updateField, errors }) => {
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [customUniversity, setCustomUniversity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleUniversityToggle = (university) => {
    const currentPrefs = formData.universityPreference || [];
    const updatedPrefs = currentPrefs.includes(university)
      ? currentPrefs.filter(u => u !== university)
      : [...currentPrefs, university];
    updateField('universityPreference', updatedPrefs);
  };

  const handleAddCustomUniversity = () => {
    if (customUniversity.trim() && !formData.universityPreference?.includes(customUniversity.trim())) {
      const currentPrefs = formData.universityPreference || [];
      updateField('universityPreference', [...currentPrefs, customUniversity.trim()]);
      setCustomUniversity('');
      setShowCustomInput(false);
    }
  };

  const displayedUniversities = showAllUniversities 
    ? POPULAR_UNIVERSITIES 
    : POPULAR_UNIVERSITIES.slice(0, 8);

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Tutor Preferences</h3>
        <p>Help us find the right tutor for you (all preferences are optional)</p>
      </div>

      <div className="step-content">
        {/* Important Note */}
        <div className="preference-note">
          <div className="note-icon">ℹ️</div>
          <div className="note-content">
            <strong>Please Note:</strong> These preferences help rank and filter tutors, 
            but don't hard-block applications. You'll still see applications from all qualified tutors.
          </div>
        </div>

        {/* Gender Preference */}
        <div className="form-group">
          <label className="form-label">
            Preferred Tutor Gender
            <span className="optional-tag">Optional</span>
          </label>
          <div className="gender-options">
            {GENDER_OPTIONS.map(option => (
              <div
                key={option.value}
                className={`gender-option ${formData.preferredGender === option.value ? 'selected' : ''}`}
                onClick={() => updateField('preferredGender', option.value)}
              >
                <div className="option-icon">{option.icon}</div>
                <div className="option-content">
                  <div className="option-label">{option.label}</div>
                  <div className="option-description">{option.description}</div>
                </div>
                <div className="selection-indicator">
                  {formData.preferredGender === option.value && '✓'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Preference */}
        <div className="form-group">
          <label className="form-label">
            Experience Level
            <span className="optional-tag">Optional</span>
          </label>
          <div className="experience-selector">
            {EXPERIENCE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                className={`experience-option ${formData.experience === option.value ? 'selected' : ''}`}
                onClick={() => updateField('experience', option.value)}
              >
                <div className="exp-label">{option.label}</div>
                <div className="exp-description">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* University Preference */}
        <div className="form-group">
          <label className="form-label">
            University Preference
            <span className="optional-tag">Optional</span>
            {formData.universityPreference?.length > 0 && (
              <span className="selection-count">
                ({formData.universityPreference.length} selected)
              </span>
            )}
          </label>

          {/* Selected Universities */}
          {formData.universityPreference?.length > 0 && (
            <div className="selected-universities">
              {formData.universityPreference.map(university => (
                <div key={university} className="university-chip">
                  <span>{university}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = formData.universityPreference.filter(u => u !== university);
                      updateField('universityPreference', updated);
                    }}
                    className="chip-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* University Options */}
          <div className="university-grid">
            {displayedUniversities.map(university => (
              <button
                key={university}
                type="button"
                className={`university-option ${formData.universityPreference?.includes(university) ? 'selected' : ''}`}
                onClick={() => handleUniversityToggle(university)}
              >
                🎓 {university}
              </button>
            ))}
          </div>

          {/* Show More/Less Button */}
          <div className="university-controls">
            {!showAllUniversities && (
              <button
                type="button"
                className="show-more-btn"
                onClick={() => setShowAllUniversities(true)}
              >
                Show more universities ({POPULAR_UNIVERSITIES.length - 8} more)
              </button>
            )}
            
            {showAllUniversities && (
              <button
                type="button"
                className="show-less-btn"
                onClick={() => setShowAllUniversities(false)}
              >
                Show less
              </button>
            )}
          </div>

          {/* Add Custom University */}
          <div className="custom-university-section">
            {!showCustomInput ? (
              <button
                type="button"
                className="add-custom-btn"
                onClick={() => setShowCustomInput(true)}
              >
                + Add other university
              </button>
            ) : (
              <div className="custom-university-input">
                <input
                  type="text"
                  placeholder="Enter university name"
                  value={customUniversity}
                  onChange={(e) => setCustomUniversity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomUniversity()}
                />
                <button 
                  type="button" 
                  onClick={handleAddCustomUniversity}
                  className="btn-small-primary"
                >
                  Add
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomUniversity('');
                  }}
                  className="btn-small-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Other Preferences */}
        <div className="form-group">
          <label htmlFor="otherPreferences" className="form-label">
            Other Preferences
            <span className="optional-tag">Optional</span>
          </label>
          <textarea
            id="otherPreferences"
            className="form-textarea"
            placeholder="Comfortable with Bengali medium, lab numericals, exam-focused teaching style..."
            rows="4"
            value={formData.otherPreferences || ''}
            onChange={(e) => updateField('otherPreferences', e.target.value)}
          />
          <div className="form-hint">
            Any specific requirements, teaching styles, or qualifications you're looking for
          </div>
        </div>

        {/* Preferences Summary */}
        {(formData.preferredGender !== 'any' || 
          formData.experience !== 'any' || 
          formData.universityPreference?.length > 0 || 
          formData.otherPreferences) && (
          <div className="preferences-summary">
            <h4>👥 Your Tutor Preferences</h4>
            <div className="summary-grid">
              {formData.preferredGender !== 'any' && (
                <div className="summary-item">
                  <span className="summary-label">Gender:</span>
                  <span className="summary-value">
                    {GENDER_OPTIONS.find(g => g.value === formData.preferredGender)?.label}
                  </span>
                </div>
              )}
              
              {formData.experience !== 'any' && (
                <div className="summary-item">
                  <span className="summary-label">Experience:</span>
                  <span className="summary-value">
                    {EXPERIENCE_OPTIONS.find(e => e.value === formData.experience)?.label}
                  </span>
                </div>
              )}
              
              {formData.universityPreference?.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Universities:</span>
                  <span className="summary-value">
                    {formData.universityPreference.length} selected
                  </span>
                </div>
              )}
              
              {formData.otherPreferences && (
                <div className="summary-item full-width">
                  <span className="summary-label">Special Requirements:</span>
                  <span className="summary-value">{formData.otherPreferences}</span>
                </div>
              )}
            </div>
            
            <div className="preference-impact">
              💡 These preferences will help us show your post to the most suitable tutors first
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step5TutorPreferences;
