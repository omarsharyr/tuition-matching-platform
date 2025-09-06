// frontend/src/components/PostWizard/Step1ClassSubjects.jsx
import React, { useState, useEffect } from 'react';

const EDUCATION_LEVELS = [
  'Primary',
  'Secondary', 
  'SSC',
  'HSC',
  'A-Levels',
  'O-Levels',
  'Admission',
  'Univ 1st-2nd yr',
  'Other'
];

const SYLLABI = [
  'Bangla',
  'English', 
  'Edexcel',
  'Cambridge',
  'IB',
  'Madrasa',
  'Other'
];

const COMMON_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Bangla',
  'ICT', 'Economics', 'Accounting', 'Finance', 'Business Studies',
  'Geography', 'History', 'Civics', 'Islamic Studies', 'Arabic',
  'Statistics', 'Psychology', 'Philosophy', 'Sociology', 'Political Science'
];

const Step1ClassSubjects = ({ formData, updateField, errors }) => {
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    // Remove emojis and limit to 80 chars
    const cleanValue = value.replace(/[\u{1F600}-\u{1F6FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
    updateField('title', cleanValue.slice(0, 80));
  };

  const handleSubjectSelect = (subject) => {
    const currentSubjects = formData.subjects || [];
    if (!currentSubjects.includes(subject)) {
      updateField('subjects', [...currentSubjects, subject]);
    }
  };

  const handleSubjectRemove = (subjectToRemove) => {
    const currentSubjects = formData.subjects || [];
    updateField('subjects', currentSubjects.filter(s => s !== subjectToRemove));
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !formData.subjects.includes(customSubject.trim())) {
      handleSubjectSelect(customSubject.trim());
      setCustomSubject('');
      setShowCustomInput(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    updateField('description', value.slice(0, 600));
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Class & Subjects</h3>
        <p>Tell us what you need tutoring for</p>
      </div>

      <div className="step-content">
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title" className="form-label required">
            Title
            <span className="char-counter">
              {formData.title?.length || 0}/80
            </span>
          </label>
          <input
            id="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder='e.g., "HSC Physics crash course (6 weeks)"'
            value={formData.title || ''}
            onChange={handleTitleChange}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <div className="form-hint">
            6-80 characters, no emojis allowed
          </div>
        </div>

        {/* Education Level */}
        <div className="form-group">
          <label htmlFor="educationLevel" className="form-label required">
            Education Level / Class
          </label>
          <select
            id="educationLevel"
            className={`form-select ${errors.educationLevel ? 'error' : ''}`}
            value={formData.educationLevel || ''}
            onChange={(e) => updateField('educationLevel', e.target.value)}
          >
            <option value="">Select education level</option>
            {EDUCATION_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.educationLevel && <span className="error-text">{errors.educationLevel}</span>}
        </div>

        {/* Subjects */}
        <div className="form-group">
          <label className="form-label required">
            Subjects
          </label>
          
          {/* Selected Subjects */}
          {formData.subjects?.length > 0 && (
            <div className="selected-subjects">
              {formData.subjects.map(subject => (
                <div key={subject} className="subject-chip">
                  <span>{subject}</span>
                  <button 
                    type="button"
                    onClick={() => handleSubjectRemove(subject)}
                    className="chip-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subject Selection */}
          <div className="subjects-selection">
            <div className="common-subjects">
              {COMMON_SUBJECTS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  className={`subject-option ${formData.subjects?.includes(subject) ? 'selected' : ''}`}
                  onClick={() => handleSubjectSelect(subject)}
                  disabled={formData.subjects?.includes(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Add Custom Subject */}
            <div className="custom-subject-section">
              {!showCustomInput ? (
                <button
                  type="button"
                  className="add-custom-btn"
                  onClick={() => setShowCustomInput(true)}
                >
                  + Add custom subject
                </button>
              ) : (
                <div className="custom-subject-input">
                  <input
                    type="text"
                    placeholder="Enter custom subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddCustomSubject}
                    className="btn-small-primary"
                  >
                    Add
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomSubject('');
                    }}
                    className="btn-small-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {errors.subjects && <span className="error-text">{errors.subjects}</span>}
        </div>

        {/* Syllabus/Medium */}
        <div className="form-group">
          <label htmlFor="syllabus" className="form-label">
            Syllabus / Medium
            <span className="optional-tag">Optional</span>
          </label>
          <select
            id="syllabus"
            className="form-select"
            value={formData.syllabus || ''}
            onChange={(e) => updateField('syllabus', e.target.value)}
          >
            <option value="">Select syllabus/medium</option>
            {SYLLABI.map(syllabus => (
              <option key={syllabus} value={syllabus}>{syllabus}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Short Description / Notes
            <span className="optional-tag">Optional</span>
            <span className="char-counter">
              {formData.description?.length || 0}/600
            </span>
          </label>
          <textarea
            id="description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Exam date, weak chapters, specific requirements..."
            rows="4"
            value={formData.description || ''}
            onChange={handleDescriptionChange}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
          <div className="form-hint">
            Provide details about exam dates, weak areas, or specific requirements
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1ClassSubjects;
