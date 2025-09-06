// frontend/src/components/PostWizard/Step3Schedule.jsx
import React from 'react';

const DAYS_OF_WEEK = [
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' }
];

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning (6 AM - 12 PM)', icon: '🌅', time: '06:00-12:00' },
  { key: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', icon: '☀️', time: '12:00-17:00' },
  { key: 'evening', label: 'Evening (5 PM - 9 PM)', icon: '🌆', time: '17:00-21:00' },
  { key: 'night', label: 'Night (9 PM - 11 PM)', icon: '🌙', time: '21:00-23:00' }
];

const Step3Schedule = ({ formData, updateField, errors }) => {
  const handleDayToggle = (dayKey) => {
    const currentDays = formData.preferredDays || [];
    const updatedDays = currentDays.includes(dayKey)
      ? currentDays.filter(d => d !== dayKey)
      : [...currentDays, dayKey];
    updateField('preferredDays', updatedDays);
  };

  const handleTimeToggle = (timeKey) => {
    const currentTimes = formData.preferredTimes || [];
    const updatedTimes = currentTimes.includes(timeKey)
      ? currentTimes.filter(t => t !== timeKey)
      : [...currentTimes, timeKey];
    updateField('preferredTimes', updatedTimes);
  };

  const handleDaysPerWeekChange = (e) => {
    const value = parseInt(e.target.value);
    updateField('daysPerWeek', value);
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Schedule Preference</h3>
        <p>When would you like to have tutoring sessions?</p>
      </div>

      <div className="step-content">
        {/* Days per Week */}
        <div className="form-group">
          <label htmlFor="daysPerWeek" className="form-label required">
            Days per Week
          </label>
          <div className="days-per-week-selector">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                type="button"
                className={`days-option ${formData.daysPerWeek === num ? 'selected' : ''}`}
                onClick={() => updateField('daysPerWeek', num)}
              >
                {num} {num === 1 ? 'day' : 'days'}
              </button>
            ))}
          </div>
          {errors.daysPerWeek && <span className="error-text">{errors.daysPerWeek}</span>}
        </div>

        {/* Preferred Days */}
        <div className="form-group">
          <label className="form-label required">
            Preferred Days
            {formData.preferredDays?.length > 0 && (
              <span className="selection-count">
                ({formData.preferredDays.length} selected)
              </span>
            )}
          </label>
          <div className="days-grid">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.key}
                type="button"
                className={`day-button ${formData.preferredDays?.includes(day.key) ? 'selected' : ''}`}
                onClick={() => handleDayToggle(day.key)}
              >
                <div className="day-short">{day.short}</div>
                <div className="day-full">{day.label}</div>
              </button>
            ))}
          </div>
          {errors.preferredDays && <span className="error-text">{errors.preferredDays}</span>}
        </div>

        {/* Preferred Times */}
        <div className="form-group">
          <label className="form-label required">
            Preferred Times
            {formData.preferredTimes?.length > 0 && (
              <span className="selection-count">
                ({formData.preferredTimes.length} selected)
              </span>
            )}
          </label>
          <div className="time-slots">
            {TIME_SLOTS.map(slot => (
              <div
                key={slot.key}
                className={`time-slot ${formData.preferredTimes?.includes(slot.key) ? 'selected' : ''}`}
                onClick={() => handleTimeToggle(slot.key)}
              >
                <div className="time-icon">{slot.icon}</div>
                <div className="time-content">
                  <div className="time-label">{slot.label}</div>
                  <div className="time-range">{slot.time}</div>
                </div>
                <div className="selection-indicator">
                  {formData.preferredTimes?.includes(slot.key) && '✓'}
                </div>
              </div>
            ))}
          </div>
          {errors.preferredTimes && <span className="error-text">{errors.preferredTimes}</span>}
          <div className="form-hint">
            💡 Exact schedule will be finalized with your tutor after acceptance
          </div>
        </div>

        {/* Optional Fields */}
        <div className="optional-section">
          <h4>Additional Schedule Details <span className="optional-tag">Optional</span></h4>
          
          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Preferred Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              value={formData.startDate || ''}
              onChange={(e) => updateField('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="duration" className="form-label">
              Duration (weeks)
            </label>
            <input
              id="duration"
              type="number"
              className="form-input"
              placeholder="e.g., 8 weeks"
              min="1"
              max="52"
              value={formData.duration || ''}
              onChange={(e) => updateField('duration', e.target.value)}
            />
            <div className="form-hint">
              How long do you expect to need tutoring?
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        {(formData.daysPerWeek && formData.preferredDays?.length > 0 && formData.preferredTimes?.length > 0) && (
          <div className="schedule-summary">
            <h4>📅 Schedule Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Frequency:</span>
                <span className="summary-value">
                  {formData.daysPerWeek} {formData.daysPerWeek === 1 ? 'day' : 'days'} per week
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Days:</span>
                <span className="summary-value">
                  {formData.preferredDays.map(dayKey => 
                    DAYS_OF_WEEK.find(d => d.key === dayKey)?.short
                  ).join(', ')}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Times:</span>
                <span className="summary-value">
                  {formData.preferredTimes.map(timeKey => 
                    TIME_SLOTS.find(t => t.key === timeKey)?.label.split('(')[0].trim()
                  ).join(', ')}
                </span>
              </div>
              {formData.startDate && (
                <div className="summary-item">
                  <span className="summary-label">Start Date:</span>
                  <span className="summary-value">
                    {new Date(formData.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {formData.duration && (
                <div className="summary-item">
                  <span className="summary-label">Duration:</span>
                  <span className="summary-value">{formData.duration} weeks</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3Schedule;
