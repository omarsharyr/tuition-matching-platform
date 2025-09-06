import React, { useState, useEffect } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import './TutorProfile.css';

const TutorProfile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    profileImage: null,

    // Professional Information
    education: '',
    institution: '',
    graduationYear: '',
    currentStatus: '', // student, working_professional, freelance_tutor
    yearsOfExperience: '',
    professionalTitle: '',

    // Teaching Information
    subjects: [],
    educationLevels: [],
    preferredLocations: [],
    teachingMode: [], // online, offline, both
    hourlyRate: '',
    availability: {
      monday: { available: false, timeSlots: [] },
      tuesday: { available: false, timeSlots: [] },
      wednesday: { available: false, timeSlots: [] },
      thursday: { available: false, timeSlots: [] },
      friday: { available: false, timeSlots: [] },
      saturday: { available: false, timeSlots: [] },
      sunday: { available: false, timeSlots: [] }
    },

    // Portfolio & Experience
    bio: '',
    teachingPhilosophy: '',
    achievements: '',
    certifications: [],
    languages: [],
    portfolio: {
      workExperience: [],
      sampleWorks: [],
      testimonials: []
    }
  });

  // Available options
  const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Bangla',
    'Computer Science', 'Economics', 'Accounting', 'Statistics', 'History',
    'Geography', 'Political Science', 'Philosophy', 'Psychology', 'Sociology'
  ];

  const EDUCATION_LEVELS = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'O Level', 'A Level', 'HSC', 'Undergraduate', 'Graduate'
  ];

  const LOCATIONS = [
    'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
    'Wari', 'Old Dhaka', 'Mohammadpur', 'Bashundhara', 'Badda'
  ];

  const LANGUAGES = ['Bangla', 'English', 'Arabic', 'Hindi', 'Urdu'];

  const TIME_SLOTS = [
    '6:00-8:00', '8:00-10:00', '10:00-12:00', '12:00-14:00',
    '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/tutor/profile');
      // setProfileData(response.data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage for now
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setProfileData(prevData => ({
        ...prevData,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setAlert({ type: 'error', message: 'Failed to load profile data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subChild] = field.split('.');
      if (subChild) {
        setProfileData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayToggle = (field, item) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleAvailabilityChange = (day, type, value) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [type]: value
        }
      }
    }));
  };

  const handleTimeSlotToggle = (day, timeSlot) => {
    setProfileData(prev => {
      const currentSlots = prev.availability[day].timeSlots || [];
      const newSlots = currentSlots.includes(timeSlot)
        ? currentSlots.filter(slot => slot !== timeSlot)
        : [...currentSlots, timeSlot];
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: {
            ...prev.availability[day],
            timeSlots: newSlots
          }
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Replace with actual API call
      // await api.put('/tutor/profile', profileData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlert({ type: 'error', message: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalTab = () => (
    <div className="tab-content">
      <h2>Personal Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            className="form-input"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            className="form-input"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            disabled
          />
          <div className="form-hint">Email cannot be changed</div>
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            className="form-input"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            className="form-input"
            value={profileData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select
            className="form-select"
            value={profileData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label className="form-label">Address</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={profileData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter your full address"
          />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-input"
            value={profileData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter your city"
          />
        </div>
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="tab-content">
      <h2>Professional Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Highest Education *</label>
          <select
            className="form-select"
            value={profileData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
          >
            <option value="">Select education level</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="diploma">Diploma</option>
            <option value="hsc">HSC</option>
            <option value="alevel">A Level</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Institution *</label>
          <input
            type="text"
            className="form-input"
            value={profileData.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
            placeholder="Your university/college name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Graduation Year</label>
          <input
            type="number"
            className="form-input"
            value={profileData.graduationYear}
            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
            placeholder="e.g. 2023"
            min="1900"
            max="2030"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Current Status *</label>
          <select
            className="form-select"
            value={profileData.currentStatus}
            onChange={(e) => handleInputChange('currentStatus', e.target.value)}
          >
            <option value="">Select your status</option>
            <option value="student">Student</option>
            <option value="working_professional">Working Professional</option>
            <option value="freelance_tutor">Freelance Tutor</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Years of Teaching Experience</label>
          <select
            className="form-select"
            value={profileData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
          >
            <option value="">Select experience</option>
            <option value="0-1">Less than 1 year</option>
            <option value="1-2">1-2 years</option>
            <option value="2-5">2-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Professional Title</label>
          <input
            type="text"
            className="form-input"
            value={profileData.professionalTitle}
            onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
            placeholder="e.g. Mathematics Teacher, Physics Instructor"
          />
        </div>
      </div>
    </div>
  );

  const renderTeachingTab = () => (
    <div className="tab-content">
      <h2>Teaching Information</h2>
      
      <div className="form-group full-width">
        <label className="form-label">Subjects I Can Teach *</label>
        <div className="checkbox-grid">
          {SUBJECTS.map(subject => (
            <div key={subject} className="checkbox-item">
              <input
                type="checkbox"
                checked={profileData.subjects.includes(subject)}
                onChange={() => handleArrayToggle('subjects', subject)}
              />
              <span className="checkbox-label">{subject}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group full-width">
        <label className="form-label">Education Levels I Can Teach *</label>
        <div className="checkbox-grid">
          {EDUCATION_LEVELS.map(level => (
            <div key={level} className="checkbox-item">
              <input
                type="checkbox"
                checked={profileData.educationLevels.includes(level)}
                onChange={() => handleArrayToggle('educationLevels', level)}
              />
              <span className="checkbox-label">{level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group full-width">
        <label className="form-label">Preferred Locations</label>
        <div className="checkbox-grid">
          {LOCATIONS.map(location => (
            <div key={location} className="checkbox-item">
              <input
                type="checkbox"
                checked={profileData.preferredLocations.includes(location)}
                onChange={() => handleArrayToggle('preferredLocations', location)}
              />
              <span className="checkbox-label">{location}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Teaching Mode *</label>
          <div className="checkbox-options">
            {['Online', 'Offline', 'Both'].map(mode => (
              <div key={mode} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={profileData.teachingMode.includes(mode.toLowerCase())}
                  onChange={() => handleArrayToggle('teachingMode', mode.toLowerCase())}
                />
                <span className="checkbox-label">{mode}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Hourly Rate (BDT)</label>
          <input
            type="number"
            className="form-input"
            value={profileData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            placeholder="Enter your hourly rate"
            min="0"
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label className="form-label">Languages I Can Teach In</label>
        <div className="checkbox-options">
          {LANGUAGES.map(language => (
            <div key={language} className="checkbox-item">
              <input
                type="checkbox"
                checked={profileData.languages.includes(language)}
                onChange={() => handleArrayToggle('languages', language)}
              />
              <span className="checkbox-label">{language}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAvailabilityTab = () => (
    <div className="tab-content">
      <h2>Availability & Schedule</h2>
      <div className="availability-section">
        {Object.keys(profileData.availability).map(day => (
          <div key={day} className="day-availability">
            <div className="day-header">
              <label className="day-toggle">
                <input
                  type="checkbox"
                  checked={profileData.availability[day].available}
                  onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                />
                <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              </label>
            </div>
            {profileData.availability[day].available && (
              <div className="time-slots">
                <div className="time-slot-grid">
                  {TIME_SLOTS.map(slot => (
                    <label key={slot} className="time-slot-item">
                      <input
                        type="checkbox"
                        checked={profileData.availability[day].timeSlots?.includes(slot) || false}
                        onChange={() => handleTimeSlotToggle(day, slot)}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <h2>Portfolio & Experience</h2>
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">Bio & Introduction</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell students about yourself, your background, and what makes you a great tutor..."
          />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Teaching Philosophy</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={profileData.teachingPhilosophy}
            onChange={(e) => handleInputChange('teachingPhilosophy', e.target.value)}
            placeholder="Describe your teaching approach and philosophy..."
          />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Achievements & Awards</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={profileData.achievements}
            onChange={(e) => handleInputChange('achievements', e.target.value)}
            placeholder="List your academic achievements, awards, certifications..."
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="tutor-profile-container">
        <TutorSidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <main className={`tutor-profile-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tutor-profile-container">
      <TutorSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main className={`tutor-profile-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-avatar">
              <img 
                src={profileData.profileImage || `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&size=100`}
                alt="Profile"
              />
              <button className="avatar-edit-btn">
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className="header-info">
              <h1>{`${profileData.firstName} ${profileData.lastName}` || 'Your Name'}</h1>
              <p className="subtitle">{profileData.professionalTitle || 'Professional Tutor'}</p>
            </div>
          </div>
          {alert.message && (
            <div className={`alert alert-${alert.type}`}>
              <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {alert.message}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <i className="fas fa-user"></i>
            Personal
          </button>
          <button
            className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('professional')}
          >
            <i className="fas fa-graduation-cap"></i>
            Professional
          </button>
          <button
            className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('teaching')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            Teaching
          </button>
          <button
            className={`tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            <i className="fas fa-calendar-alt"></i>
            Availability
          </button>
          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <i className="fas fa-briefcase"></i>
            Portfolio
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'professional' && renderProfessionalTab()}
          {activeTab === 'teaching' && renderTeachingTab()}
          {activeTab === 'availability' && renderAvailabilityTab()}
          {activeTab === 'portfolio' && renderPortfolioTab()}
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Profile
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TutorProfile;
