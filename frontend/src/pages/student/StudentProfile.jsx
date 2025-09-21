// frontend/src/pages/student/StudentProfile.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import useSidebar from '../../hooks/useSidebar';
import api from '../../utils/api';
import './StudentProfile.css';

const StudentProfile = () => {
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(true);
  
  // Auth user data
  const user = useMemo(() => {
    try { 
      const userData = localStorage.getItem("user") || localStorage.getItem("authUser");
      return userData ? JSON.parse(userData) : {};
    }
    catch { return {}; }
  }, []);

  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    
    // Academic Information
    currentEducationLevel: '',
    institution: '',
    preferredSubjects: [],
    academicGoals: '',
    
    // Contact & Emergency
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    
    // Preferences
    preferredTutorGender: 'Any',
    preferredTimeSlots: [],
    maxBudget: '',
    learningStyle: '',
    
    // About
    bio: '',
    interests: '',
    achievements: ''
  });

  // Available options
  const educationLevels = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'O Level', 'A Level', 'SSC', 'HSC', 'University 1st Year',
    'University 2nd Year', 'University 3rd Year', 'University Final Year'
  ];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Bangla',
    'ICT', 'Economics', 'Accounting', 'Finance', 'Business Studies',
    'Geography', 'History', 'Civics', 'Islamic Studies', 'Arabic',
    'Statistics', 'Psychology', 'Philosophy', 'Sociology', 'Political Science'
  ];

  const timeSlots = [
    'Early Morning (6:00-9:00 AM)',
    'Morning (9:00-12:00 PM)', 
    'Afternoon (12:00-3:00 PM)',
    'Evening (3:00-6:00 PM)',
    'Night (6:00-9:00 PM)',
    'Late Night (9:00-11:00 PM)'
  ];

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load user data
      const response = await api.get('/student/profile');
      if (response.data) {
        setFormData({
          ...formData,
          name: response.data.name || user.name || '',
          email: response.data.email || user.email || '',
          phone: response.data.phone || '',
          city: response.data.city || '',
          ...response.data
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
      // Set basic user data from localStorage
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts editing
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle array inputs (subjects, time slots)
  const handleArrayToggle = (field, item) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return { ...prev, [field]: newArray };
    });
  };

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put('/student/profile', formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-profile-container">
        <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className={`student-profile-main ${isCollapsed ? 'expanded' : ''}`}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={closeSidebar}
        />
      )}
      
      <div className={`student-profile-main ${isCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-avatar">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt={user.name || 'Profile'}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=' + (user.name?.[0] || 'U');
                }}
              />
              <button className="avatar-edit-btn">
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className="header-info">
              <h1>My Profile</h1>
              <p className="subtitle">Manage your personal information and preferences</p>
            </div>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="fas fa-user"></i>
            Personal Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            <i className="fas fa-graduation-cap"></i>
            Academic
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-cog"></i>
            Preferences
          </button>
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <i className="fas fa-info-circle"></i>
            About Me
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <h2>Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Dhaka, Chittagong, Sylhet..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your full address"
                  rows="3"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Parent/Guardian name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === 'academic' && (
            <div className="tab-content">
              <h2>Academic Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Education Level</label>
                  <select
                    className="form-select"
                    value={formData.currentEducationLevel}
                    onChange={(e) => handleInputChange('currentEducationLevel', e.target.value)}
                  >
                    <option value="">Select Level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    placeholder="School/College/University name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Subjects</label>
                <div className="checkbox-grid">
                  {subjects.map(subject => (
                    <label key={subject} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.preferredSubjects.includes(subject)}
                        onChange={() => handleArrayToggle('preferredSubjects', subject)}
                      />
                      <span className="checkbox-label">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Goals</label>
                <textarea
                  className="form-textarea"
                  value={formData.academicGoals}
                  onChange={(e) => handleInputChange('academicGoals', e.target.value)}
                  placeholder="Describe your academic goals and what you want to achieve"
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <h2>Learning Preferences</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Preferred Tutor Gender</label>
                  <select
                    className="form-select"
                    value={formData.preferredTutorGender}
                    onChange={(e) => handleInputChange('preferredTutorGender', e.target.value)}
                  >
                    <option value="Any">No Preference</option>
                    <option value="male">Male Tutor</option>
                    <option value="female">Female Tutor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Budget (per month)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxBudget}
                    onChange={(e) => handleInputChange('maxBudget', e.target.value)}
                    placeholder="Enter amount in BDT"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Slots</label>
                <div className="checkbox-grid">
                  {timeSlots.map(slot => (
                    <label key={slot} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.preferredTimeSlots.includes(slot)}
                        onChange={() => handleArrayToggle('preferredTimeSlots', slot)}
                      />
                      <span className="checkbox-label">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Learning Style</label>
                <select
                  className="form-select"
                  value={formData.learningStyle}
                  onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                >
                  <option value="">Select Learning Style</option>
                  <option value="visual">Visual (Diagrams, Charts, Videos)</option>
                  <option value="auditory">Auditory (Lectures, Discussions)</option>
                  <option value="reading">Reading/Writing (Books, Notes)</option>
                  <option value="kinesthetic">Kinesthetic (Hands-on Activities)</option>
                  <option value="mixed">Mixed Approach</option>
                </select>
              </div>
            </div>
          )}

          {/* About Me Tab */}
          {activeTab === 'about' && (
            <div className="tab-content">
              <h2>About Me</h2>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your background, and what motivates you to learn"
                  rows="4"
                />
                <small className="form-hint">This will be visible to potential tutors</small>
              </div>

              <div className="form-group">
                <label className="form-label">Interests & Hobbies</label>
                <textarea
                  className="form-textarea"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  placeholder="What are your interests and hobbies outside of academics?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Achievements</label>
                <textarea
                  className="form-textarea"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="List your academic achievements, awards, or notable accomplishments"
                  rows="4"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="profile-actions">
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
