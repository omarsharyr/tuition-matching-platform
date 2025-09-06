import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminSettings.css';

const AdminSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      platformName: 'TutorConnect',
      supportEmail: 'support@tutorconnect.com',
      maintenanceMode: false,
      enableRegistration: true,
      defaultCurrency: 'BDT',
      timeZone: 'Asia/Dhaka'
    },
    subjects: [
      { id: 1, name: 'Mathematics', isActive: true, color: '#3b82f6' },
      { id: 2, name: 'Physics', isActive: true, color: '#10b981' },
      { id: 3, name: 'Chemistry', isActive: true, color: '#f59e0b' },
      { id: 4, name: 'Biology', isActive: true, color: '#ef4444' },
      { id: 5, name: 'English', isActive: true, color: '#8b5cf6' },
      { id: 6, name: 'Bengali', isActive: true, color: '#06b6d4' },
      { id: 7, name: 'ICT', isActive: true, color: '#84cc16' },
      { id: 8, name: 'Economics', isActive: false, color: '#f97316' }
    ],
    classes: [
      { id: 1, name: 'Class 6', isActive: true },
      { id: 2, name: 'Class 7', isActive: true },
      { id: 3, name: 'Class 8', isActive: true },
      { id: 4, name: 'Class 9', isActive: true },
      { id: 5, name: 'Class 10', isActive: true },
      { id: 6, name: 'HSC', isActive: true },
      { id: 7, name: 'University', isActive: true }
    ],
    commissions: {
      tutorCommission: 15,
      platformFee: 5,
      paymentProcessingFee: 2.5
    },
    holidays: [
      { id: 1, name: 'Eid ul-Fitr', date: '2024-05-01', isActive: true },
      { id: 2, name: 'Independence Day', date: '2024-03-26', isActive: true },
      { id: 3, name: 'Victory Day', date: '2024-12-16', isActive: true },
      { id: 4, name: 'International Mother Language Day', date: '2024-02-21', isActive: true }
    ]
  });

  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6' });
  const [newClass, setNewClass] = useState({ name: '' });
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings');
    }
    setSaving(false);
  };

  const addSubject = () => {
    if (!newSubject.name.trim()) {
      console.error('Subject name is required');
      return;
    }

    const subject = {
      id: Date.now(),
      name: newSubject.name.trim(),
      color: newSubject.color,
      isActive: true
    };

    setSettings(prev => ({
      ...prev,
      subjects: [...prev.subjects, subject]
    }));

    setNewSubject({ name: '', color: '#3b82f6' });
    console.log('Subject added successfully!');
  };

  const addClass = () => {
    if (!newClass.name.trim()) {
      console.error('Class name is required');
      return;
    }

    const classItem = {
      id: Date.now(),
      name: newClass.name.trim(),
      isActive: true
    };

    setSettings(prev => ({
      ...prev,
      classes: [...prev.classes, classItem]
    }));

    setNewClass({ name: '' });
    console.log('Class added successfully!');
  };

  const addHoliday = () => {
    if (!newHoliday.name.trim() || !newHoliday.date) {
      console.error('Holiday name and date are required');
      return;
    }

    const holiday = {
      id: Date.now(),
      name: newHoliday.name.trim(),
      date: newHoliday.date,
      isActive: true
    };

    setSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, holiday]
    }));

    setNewHoliday({ name: '', date: '' });
    console.log('Holiday added successfully!');
  };

  const deleteSubject = (id) => {
    setSettings(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject.id !== id)
    }));
    console.log('Subject deleted successfully!');
  };

  const deleteClass = (id) => {
    setSettings(prev => ({
      ...prev,
      classes: prev.classes.filter(classItem => classItem.id !== id)
    }));
    console.log('Class deleted successfully!');
  };

  const deleteHoliday = (id) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter(holiday => holiday.id !== id)
    }));
    console.log('Holiday deleted successfully!');
  };

  const toggleSubjectStatus = (id) => {
    setSettings(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject =>
        subject.id === id ? { ...subject, isActive: !subject.isActive } : subject
      )
    }));
  };

  const toggleClassStatus = (id) => {
    setSettings(prev => ({
      ...prev,
      classes: prev.classes.map(classItem =>
        classItem.id === id ? { ...classItem, isActive: !classItem.isActive } : classItem
      )
    }));
  };

  const toggleHolidayStatus = (id) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.map(holiday =>
        holiday.id === id ? { ...holiday, isActive: !holiday.isActive } : holiday
      )
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'subjects', name: 'Subjects', icon: '📚' },
    { id: 'classes', name: 'Classes', icon: '🎓' },
    { id: 'commissions', name: 'Commissions', icon: '💰' },
    { id: 'holidays', name: 'Holidays', icon: '📅' }
  ];

  if (loading) {
    return (
      <div className="settings-container">
        <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`settings-content ${sidebarCollapsed ? 'expanded' : 'normal'}`}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`settings-content ${sidebarCollapsed ? 'expanded' : 'normal'}`}>
        
        {/* Header */}
        <div className="settings-header">
          <div className="header-left">
            <h1>System Settings</h1>
            <p>Configure platform settings and manage system preferences</p>
          </div>
          <button 
            className={`save-button ${saving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                💾 Save Changes
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>General Settings</h2>
                <p>Configure basic platform settings</p>
              </div>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <label>Platform Name</label>
                  <input
                    type="text"
                    value={settings.general.platformName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, platformName: e.target.value }
                    }))}
                  />
                </div>

                <div className="setting-card">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, supportEmail: e.target.value }
                    }))}
                  />
                </div>

                <div className="setting-card">
                  <label>Default Currency</label>
                  <select
                    value={settings.general.defaultCurrency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, defaultCurrency: e.target.value }
                    }))}
                  >
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div className="setting-card">
                  <label>Time Zone</label>
                  <select
                    value={settings.general.timeZone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, timeZone: e.target.value }
                    }))}
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>

                <div className="setting-card checkbox-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, maintenanceMode: e.target.checked }
                      }))}
                    />
                    <span className="checkbox-custom"></span>
                    Maintenance Mode
                  </label>
                  <p>Enable to temporarily disable platform access for maintenance</p>
                </div>

                <div className="setting-card checkbox-card">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.general.enableRegistration}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, enableRegistration: e.target.checked }
                      }))}
                    />
                    <span className="checkbox-custom"></span>
                    Enable Registration
                  </label>
                  <p>Allow new users to register on the platform</p>
                </div>
              </div>
            </div>
          )}

          {/* Subjects Settings */}
          {activeTab === 'subjects' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Subject Management</h2>
                <p>Add, edit, and manage available subjects</p>
              </div>

              <div className="add-item-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Subject name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="color"
                    value={newSubject.color}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, color: e.target.value }))}
                  />
                  <button onClick={addSubject} className="add-button">
                    ➕ Add Subject
                  </button>
                </div>
              </div>

              <div className="items-list">
                {settings.subjects.map(subject => (
                  <div key={subject.id} className="item-row">
                    <div className="item-info">
                      <span 
                        className="color-indicator" 
                        style={{ backgroundColor: subject.color }}
                      ></span>
                      <span className="item-name">{subject.name}</span>
                      <span className={`status-badge ${subject.isActive ? 'active' : 'inactive'}`}>
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button 
                        onClick={() => toggleSubjectStatus(subject.id)}
                        className={`toggle-button ${subject.isActive ? 'active' : ''}`}
                      >
                        {subject.isActive ? '🔴' : '🟢'}
                      </button>
                      <button 
                        onClick={() => deleteSubject(subject.id)}
                        className="delete-button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes Settings */}
          {activeTab === 'classes' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Class Management</h2>
                <p>Add, edit, and manage available classes</p>
              </div>

              <div className="add-item-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Class name"
                    value={newClass.name}
                    onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <button onClick={addClass} className="add-button">
                    ➕ Add Class
                  </button>
                </div>
              </div>

              <div className="items-list">
                {settings.classes.map(classItem => (
                  <div key={classItem.id} className="item-row">
                    <div className="item-info">
                      <span className="item-name">{classItem.name}</span>
                      <span className={`status-badge ${classItem.isActive ? 'active' : 'inactive'}`}>
                        {classItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button 
                        onClick={() => toggleClassStatus(classItem.id)}
                        className={`toggle-button ${classItem.isActive ? 'active' : ''}`}
                      >
                        {classItem.isActive ? '🔴' : '🟢'}
                      </button>
                      <button 
                        onClick={() => deleteClass(classItem.id)}
                        className="delete-button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commissions Settings */}
          {activeTab === 'commissions' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Commission Settings</h2>
                <p>Configure platform fees and commission rates</p>
              </div>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <label>Tutor Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.commissions.tutorCommission}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      commissions: { ...prev.commissions, tutorCommission: parseFloat(e.target.value) }
                    }))}
                  />
                  <p>Percentage charged from tutors for each completed session</p>
                </div>

                <div className="setting-card">
                  <label>Platform Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.commissions.platformFee}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      commissions: { ...prev.commissions, platformFee: parseFloat(e.target.value) }
                    }))}
                  />
                  <p>Additional platform service fee</p>
                </div>

                <div className="setting-card">
                  <label>Payment Processing Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.commissions.paymentProcessingFee}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      commissions: { ...prev.commissions, paymentProcessingFee: parseFloat(e.target.value) }
                    }))}
                  />
                  <p>Fee charged for payment processing</p>
                </div>
              </div>
            </div>
          )}

          {/* Holidays Settings */}
          {activeTab === 'holidays' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Holiday Management</h2>
                <p>Add and manage platform holidays</p>
              </div>

              <div className="add-item-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Holiday name"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <button onClick={addHoliday} className="add-button">
                    ➕ Add Holiday
                  </button>
                </div>
              </div>

              <div className="items-list">
                {settings.holidays.map(holiday => (
                  <div key={holiday.id} className="item-row">
                    <div className="item-info">
                      <span className="item-name">{holiday.name}</span>
                      <span className="item-date">{new Date(holiday.date).toLocaleDateString()}</span>
                      <span className={`status-badge ${holiday.isActive ? 'active' : 'inactive'}`}>
                        {holiday.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button 
                        onClick={() => toggleHolidayStatus(holiday.id)}
                        className={`toggle-button ${holiday.isActive ? 'active' : ''}`}
                      >
                        {holiday.isActive ? '🔴' : '🟢'}
                      </button>
                      <button 
                        onClick={() => deleteHoliday(holiday.id)}
                        className="delete-button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
