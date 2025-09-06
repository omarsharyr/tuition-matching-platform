import React, { useState } from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    classLevel: '',
    subjects: [],
    medium: 'Bangla',
    mode: 'home',
    location: '',
    address: '',
    preferredGender: 'Any',
    days: [],
    timeSlots: [],
    budget: { min: '', max: '' },
    notes: ''
  });

  const [errors, setErrors] = useState({});

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

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM', '8:00 PM - 10:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.classLevel) newErrors.classLevel = 'Class level is required';
    if (formData.subjects.length === 0) newErrors.subjects = 'At least one subject is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (formData.days.length === 0) newErrors.days = 'At least one day is required';
    if (formData.timeSlots.length === 0) newErrors.timeSlots = 'At least one time slot is required';
    if (!formData.budget.min || !formData.budget.max) newErrors.budget = 'Budget range is required';
    if (parseInt(formData.budget.min) >= parseInt(formData.budget.max)) {
      newErrors.budget = 'Maximum budget must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        classLevel: '',
        subjects: [],
        medium: 'Bangla',
        mode: 'home',
        location: '',
        address: '',
        preferredGender: 'Any',
        days: [],
        timeSlots: [],
        budget: { min: '', max: '' },
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-post-modal">
        <div className="modal-header">
          <h2>Create New Tuition Post</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Post Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Need experienced Math tutor for HSC"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="classLevel">Class Level *</label>
                <select
                  id="classLevel"
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleInputChange}
                  className={errors.classLevel ? 'error' : ''}
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.classLevel && <span className="error-text">{errors.classLevel}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="medium">Medium</label>
                <select
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                >
                  <option value="Bangla">Bangla</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Subjects *</label>
              <div className="checkbox-group">
                {subjects.map(subject => (
                  <label key={subject} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleMultiSelect('subjects', subject)}
                    />
                    {subject}
                  </label>
                ))}
              </div>
              {errors.subjects && <span className="error-text">{errors.subjects}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Location & Mode</h3>
            
            <div className="form-group">
              <label htmlFor="mode">Tuition Mode</label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
              >
                <option value="home">At Student's Home</option>
                <option value="tutor">At Tutor's Place</option>
                <option value="online">Online</option>
                <option value="both">Both Online & Offline</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Area/Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Dhaka, Gulshan"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="preferredGender">Preferred Tutor Gender</label>
                <select
                  id="preferredGender"
                  name="preferredGender"
                  value={formData.preferredGender}
                  onChange={handleInputChange}
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Full Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address with landmarks"
                rows="2"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule & Budget</h3>
            
            <div className="form-group">
              <label>Preferred Days *</label>
              <div className="checkbox-group days-grid">
                {days.map(day => (
                  <label key={day} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day)}
                      onChange={() => handleMultiSelect('days', day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
              {errors.days && <span className="error-text">{errors.days}</span>}
            </div>

            <div className="form-group">
              <label>Preferred Time Slots *</label>
              <div className="checkbox-group">
                {timeSlots.map(slot => (
                  <label key={slot} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.timeSlots.includes(slot)}
                      onChange={() => handleMultiSelect('timeSlots', slot)}
                    />
                    {slot}
                  </label>
                ))}
              </div>
              {errors.timeSlots && <span className="error-text">{errors.timeSlots}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget.min">Min Budget (৳/month) *</label>
                <input
                  type="number"
                  id="budget.min"
                  name="budget.min"
                  value={formData.budget.min}
                  onChange={handleInputChange}
                  placeholder="5000"
                  min="1000"
                  className={errors.budget ? 'error' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget.max">Max Budget (৳/month) *</label>
                <input
                  type="number"
                  id="budget.max"
                  name="budget.max"
                  value={formData.budget.max}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="1000"
                  className={errors.budget ? 'error' : ''}
                />
              </div>
            </div>
            {errors.budget && <span className="error-text">{errors.budget}</span>}
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any specific requirements or additional information..."
                rows="3"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
