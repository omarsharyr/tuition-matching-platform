// frontend/src/components/PostWizard/PostWizard.jsx
import React, { useState, useReducer } from 'react';
import Step1ClassSubjects from './Step1ClassSubjects';
import Step2Location from './Step2Location';
import Step3Schedule from './Step3Schedule';
import Step4Budget from './Step4Budget';
import Step5TutorPreferences from './Step5TutorPreferences';
import Step6Review from './Step6Review';
import './PostWizard.css';

// Form state reducer
const initialState = {
  // Step 1: Class & Subjects
  title: '',
  educationLevel: '',
  subjects: [],
  syllabus: '',
  description: '',
  
  // Step 2: Location
  area: '',
  exactAddress: '',
  teachingMode: '',
  
  // Step 3: Schedule
  daysPerWeek: 1,
  preferredDays: [],
  preferredTimes: [],
  startDate: '',
  duration: '',
  
  // Step 4: Budget
  paymentType: '',
  budgetAmount: '',
  currency: 'BDT',
  paymentNotes: '',
  
  // Step 5: Tutor Preferences
  preferredGender: 'Any',
  experience: 'Any',
  universityPreference: [],
  otherPreferences: '',
  
  // Step 6: Meta
  isDraft: false
};

function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_MULTIPLE':
      return { ...state, ...action.fields };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const PostWizard = ({ isOpen, onClose, onSubmit }) => {
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const totalSteps = 6;
  
  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateMultiple = (fields) => {
    dispatch({ type: 'UPDATE_MULTIPLE', fields });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 6 || formData.title.length > 80) {
          newErrors.title = 'Title must be between 6 and 80 characters';
        }
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
        if (formData.subjects.length === 0) newErrors.subjects = 'Please add at least one subject';
        if (formData.description.length > 600) newErrors.description = 'Description must be under 600 characters';
        break;
        
      case 2:
        if (!formData.area.trim()) newErrors.area = 'Area/Thana is required';
        if (!formData.teachingMode) newErrors.teachingMode = 'Teaching mode is required';
        break;
        
      case 3:
        if (!formData.daysPerWeek || formData.daysPerWeek < 1 || formData.daysPerWeek > 7) {
          newErrors.daysPerWeek = 'Days per week must be between 1 and 7';
        }
        if (formData.preferredDays.length === 0) newErrors.preferredDays = 'Please select at least one day';
        if (formData.preferredTimes.length === 0) newErrors.preferredTimes = 'Please select at least one time slot';
        break;
        
      case 4:
        if (!formData.paymentType) newErrors.paymentType = 'Payment type is required';
        if (!formData.budgetAmount) newErrors.budgetAmount = 'Budget amount is required';
        else if (formData.budgetAmount < 500 || formData.budgetAmount > 200000) {
          newErrors.budgetAmount = 'Budget must be between ৳500 and ৳200,000';
        }
        break;
        
      case 5:
        // All fields are optional in step 5
        break;
        
      case 6:
        // Final validation - check all required fields
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    
    try {
      const postData = {
        ...formData,
        isDraft
      };
      
      await onSubmit(postData);
      
      // Reset form and close
      dispatch({ type: 'RESET' });
      setCurrentStep(1);
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="wizard-progress">
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i + 1} className="progress-step-wrapper">
              <div 
                className={`progress-step ${i + 1 <= currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
                onClick={() => i + 1 < currentStep && setCurrentStep(i + 1)}
              >
                {i + 1 < currentStep ? '✓' : i + 1}
              </div>
              {i < totalSteps - 1 && <div className="progress-line" />}
            </div>
          ))}
        </div>
        <div className="progress-labels">
          <span className="step-label">Class & Subjects</span>
          <span className="step-label">Location</span>
          <span className="step-label">Schedule</span>
          <span className="step-label">Budget</span>
          <span className="step-label">Preferences</span>
          <span className="step-label">Review</span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      updateField,
      updateMultiple,
      errors
    };

    switch (currentStep) {
      case 1:
        return <Step1ClassSubjects {...stepProps} />;
      case 2:
        return <Step2Location {...stepProps} />;
      case 3:
        return <Step3Schedule {...stepProps} />;
      case 4:
        return <Step4Budget {...stepProps} />;
      case 5:
        return <Step5TutorPreferences {...stepProps} />;
      case 6:
        return <Step6Review {...stepProps} onSubmit={handleSubmit} loading={loading} />;
      default:
        return <Step1ClassSubjects {...stepProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        <div className="wizard-header">
          <h2>Create Tuition Post</h2>
          <button className="wizard-close" onClick={onClose}>×</button>
        </div>
        
        {renderProgressBar()}
        
        <div className="wizard-content">
          {renderStep()}
        </div>
        
        <div className="wizard-footer">
          <div className="wizard-actions">
            {currentStep > 1 && (
              <button 
                className="btn-secondary" 
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </button>
            )}
            
            <div className="action-spacer" />
            
            {currentStep < totalSteps ? (
              <button 
                className="btn-primary" 
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <div className="final-actions">
                <button 
                  className="btn-outline" 
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  Save Draft
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            )}
          </div>
          
          <div className="step-indicator">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostWizard;
