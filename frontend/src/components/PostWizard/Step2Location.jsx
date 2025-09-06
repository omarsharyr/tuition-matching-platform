// frontend/src/components/PostWizard/Step2Location.jsx
import React, { useState, useEffect } from 'react';

const DHAKA_AREAS = [
  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
  'Wari', 'Old Dhaka', 'New Market', 'Elephant Road', 'Panthapath',
  'Farmgate', 'Tejgaon', 'Motijheel', 'Ramna', 'Azimpur', 'Lalbagh',
  'Shantinagar', 'Malibagh', 'Rampura', 'Badda', 'Baridhara', 'Bashundhara',
  'Lalmatia', 'Mohakhali', 'Kalabagan', 'Green Road', 'Jigatala',
  'Kathalbagan', 'Shyamoli', 'Adabor', 'Ring Road', 'Shukrabad'
];

const TEACHING_MODES = [
  { value: 'student_home', label: "Student's Home", icon: '🏠' },
  { value: 'tutor_place', label: "Tutor's Place", icon: '📍' },
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'hybrid', label: 'Hybrid (Both)', icon: '🔄' }
];

const Step2Location = ({ formData, updateField, errors }) => {
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  
  const filteredAreas = DHAKA_AREAS.filter(area => 
    area.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const handleAreaSelect = (area) => {
    updateField('area', area);
    setAreaSearch(area);
    setShowAreaDropdown(false);
  };

  const handleAreaInputChange = (e) => {
    const value = e.target.value;
    setAreaSearch(value);
    updateField('area', value);
    setShowAreaDropdown(true);
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Location</h3>
        <p>Where will the tutoring take place?</p>
      </div>

      <div className="step-content">
        {/* Area/Thana */}
        <div className="form-group">
          <label htmlFor="area" className="form-label required">
            Area / Thana
          </label>
          <div className="autocomplete-wrapper">
            <input
              id="area"
              type="text"
              className={`form-input ${errors.area ? 'error' : ''}`}
              placeholder="Type to search areas (e.g., Dhanmondi, Mirpur)"
              value={areaSearch}
              onChange={handleAreaInputChange}
              onFocus={() => setShowAreaDropdown(true)}
            />
            
            {showAreaDropdown && filteredAreas.length > 0 && (
              <div className="autocomplete-dropdown">
                {filteredAreas.slice(0, 8).map(area => (
                  <div
                    key={area}
                    className="autocomplete-item"
                    onClick={() => handleAreaSelect(area)}
                  >
                    📍 {area}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.area && <span className="error-text">{errors.area}</span>}
          <div className="form-hint">
            This helps tutors find opportunities near them
          </div>
        </div>

        {/* Teaching Mode */}
        <div className="form-group">
          <label className="form-label required">
            Teaching Mode
          </label>
          <div className="teaching-mode-options">
            {TEACHING_MODES.map(mode => (
              <div
                key={mode.value}
                className={`teaching-mode-card ${formData.teachingMode === mode.value ? 'selected' : ''}`}
                onClick={() => updateField('teachingMode', mode.value)}
              >
                <div className="mode-icon">{mode.icon}</div>
                <div className="mode-label">{mode.label}</div>
                <div className="mode-description">
                  {mode.value === 'student_home' && 'Tutor comes to your location'}
                  {mode.value === 'tutor_place' && 'You go to tutor\'s location'}
                  {mode.value === 'online' && 'Virtual sessions via video call'}
                  {mode.value === 'hybrid' && 'Mix of online and in-person'}
                </div>
              </div>
            ))}
          </div>
          {errors.teachingMode && <span className="error-text">{errors.teachingMode}</span>}
        </div>

        {/* Online Mode Special Note */}
        {formData.teachingMode === 'online' && (
          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <strong>Online Mode Selected</strong>
              <p>Area is still required for discovery purposes, but sessions will be conducted online.</p>
            </div>
          </div>
        )}

        {/* Exact Address */}
        <div className="form-group">
          <label htmlFor="exactAddress" className="form-label">
            Exact Address
            <span className="optional-tag">Optional</span>
            <span className="privacy-badge" title="This is kept private and never shown to tutors publicly">
              🔒 Private
            </span>
          </label>
          <textarea
            id="exactAddress"
            className="form-textarea"
            placeholder="House/flat number, road, landmark (kept private)"
            rows="3"
            value={formData.exactAddress || ''}
            onChange={(e) => updateField('exactAddress', e.target.value)}
          />
          <div className="form-hint privacy-hint">
            <div className="privacy-info">
              🔐 <strong>Privacy Protection:</strong> Your exact address is never shown publicly. 
              Only shared with accepted tutors for scheduling purposes.
            </div>
          </div>
        </div>

        {/* Location Summary */}
        {formData.area && formData.teachingMode && (
          <div className="location-summary">
            <h4>📍 Location Summary</h4>
            <div className="summary-item">
              <span className="summary-label">Area:</span>
              <span className="summary-value">{formData.area}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Mode:</span>
              <span className="summary-value">
                {TEACHING_MODES.find(m => m.value === formData.teachingMode)?.label}
              </span>
            </div>
            {formData.teachingMode === 'online' && (
              <div className="summary-note">
                Area listed for discovery; sessions will be online
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2Location;
