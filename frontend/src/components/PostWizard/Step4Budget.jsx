// frontend/src/components/PostWizard/Step4Budget.jsx
import React, { useState, useEffect } from 'react';

const PAYMENT_TYPES = [
  { 
    value: 'hourly', 
    label: 'Hourly', 
    icon: '⏰',
    description: 'Pay per hour of tutoring',
    example: '৳800/hour'
  },
  { 
    value: 'monthly', 
    label: 'Monthly', 
    icon: '📅',
    description: 'Fixed monthly payment',
    example: '৳8,000/month'
  },
  { 
    value: 'per_session', 
    label: 'Per Session', 
    icon: '📚',
    description: 'Pay per tutoring session',
    example: '৳1,200/session'
  },
  { 
    value: 'package', 
    label: 'Package', 
    icon: '📦',
    description: 'One-time payment for course',
    example: '৳15,000 total'
  }
];

const BUDGET_RANGES = {
  hourly: [
    { min: 500, max: 800, label: '৳500-800' },
    { min: 800, max: 1200, label: '৳800-1,200' },
    { min: 1200, max: 1800, label: '৳1,200-1,800' },
    { min: 1800, max: 2500, label: '৳1,800-2,500' },
    { min: 2500, max: 5000, label: '৳2,500+' }
  ],
  monthly: [
    { min: 3000, max: 6000, label: '৳3,000-6,000' },
    { min: 6000, max: 10000, label: '৳6,000-10,000' },
    { min: 10000, max: 15000, label: '৳10,000-15,000' },
    { min: 15000, max: 25000, label: '৳15,000-25,000' },
    { min: 25000, max: 50000, label: '৳25,000+' }
  ],
  per_session: [
    { min: 800, max: 1200, label: '৳800-1,200' },
    { min: 1200, max: 1800, label: '৳1,200-1,800' },
    { min: 1800, max: 2500, label: '৳1,800-2,500' },
    { min: 2500, max: 4000, label: '৳2,500-4,000' },
    { min: 4000, max: 8000, label: '৳4,000+' }
  ],
  package: [
    { min: 5000, max: 15000, label: '৳5,000-15,000' },
    { min: 15000, max: 30000, label: '৳15,000-30,000' },
    { min: 30000, max: 50000, label: '৳30,000-50,000' },
    { min: 50000, max: 100000, label: '৳50,000-1,00,000' },
    { min: 100000, max: 200000, label: '৳1,00,000+' }
  ]
};

const Step4Budget = ({ formData, updateField, errors }) => {
  const [customAmount, setCustomAmount] = useState(false);

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  const handlePaymentTypeChange = (paymentType) => {
    updateField('paymentType', paymentType);
    // Reset budget when payment type changes
    updateField('budgetAmount', '');
    setCustomAmount(false);
  };

  const handleBudgetRangeSelect = (range) => {
    updateField('budgetAmount', range.min);
    setCustomAmount(false);
  };

  const handleCustomAmountToggle = () => {
    setCustomAmount(true);
    updateField('budgetAmount', '');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    updateField('budgetAmount', value ? parseInt(value) : '');
  };

  const getBudgetRanges = () => {
    return BUDGET_RANGES[formData.paymentType] || [];
  };

  const getPaymentTypeLabel = () => {
    const paymentType = PAYMENT_TYPES.find(p => p.value === formData.paymentType);
    return paymentType ? paymentType.label.toLowerCase() : '';
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3>Payment & Budget</h3>
        <p>Set your payment preferences and budget</p>
      </div>

      <div className="step-content">
        {/* Payment Type Selection */}
        <div className="form-group">
          <label className="form-label required">
            Payment Type
          </label>
          <div className="payment-types">
            {PAYMENT_TYPES.map(type => (
              <div
                key={type.value}
                className={`payment-type-card ${formData.paymentType === type.value ? 'selected' : ''}`}
                onClick={() => handlePaymentTypeChange(type.value)}
              >
                <div className="payment-icon">{type.icon}</div>
                <div className="payment-content">
                  <div className="payment-label">{type.label}</div>
                  <div className="payment-description">{type.description}</div>
                  <div className="payment-example">{type.example}</div>
                </div>
                <div className="selection-indicator">
                  {formData.paymentType === type.value && '✓'}
                </div>
              </div>
            ))}
          </div>
          {errors.paymentType && <span className="error-text">{errors.paymentType}</span>}
        </div>

        {/* Budget Amount */}
        {formData.paymentType && (
          <div className="form-group">
            <label className="form-label required">
              Budget Amount
              <span className="currency-indicator">BDT (৳)</span>
            </label>

            {/* Predefined Ranges */}
            <div className="budget-ranges">
              <div className="ranges-label">Popular ranges:</div>
              <div className="range-buttons">
                {getBudgetRanges().map((range, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`range-button ${formData.budgetAmount >= range.min && formData.budgetAmount < range.max ? 'selected' : ''}`}
                    onClick={() => handleBudgetRangeSelect(range)}
                  >
                    {range.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`range-button custom ${customAmount ? 'selected' : ''}`}
                  onClick={handleCustomAmountToggle}
                >
                  Custom Amount
                </button>
              </div>
            </div>

            {/* Custom Amount Input */}
            {(customAmount || (!getBudgetRanges().some(range => 
              formData.budgetAmount >= range.min && formData.budgetAmount < range.max
            ) && formData.budgetAmount)) && (
              <div className="custom-amount-input">
                <div className="amount-input-wrapper">
                  <span className="currency-prefix">৳</span>
                  <input
                    type="text"
                    className={`form-input amount-input ${errors.budgetAmount ? 'error' : ''}`}
                    placeholder="Enter amount"
                    value={formData.budgetAmount || ''}
                    onChange={handleAmountChange}
                  />
                  <span className="amount-suffix">/{getPaymentTypeLabel()}</span>
                </div>
                {formData.budgetAmount && (
                  <div className="amount-preview">
                    {formatCurrency(formData.budgetAmount)} per {getPaymentTypeLabel()}
                  </div>
                )}
              </div>
            )}

            {errors.budgetAmount && <span className="error-text">{errors.budgetAmount}</span>}

            <div className="budget-guidelines">
              <div className="guidelines-header">💡 Budget Guidelines</div>
              <ul>
                <li>Consider tutor experience and qualifications</li>
                <li>Factor in travel time for home tutoring</li>
                <li>Online sessions may be priced lower</li>
                <li>Specialized subjects often cost more</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payment Notes */}
        <div className="form-group">
          <label htmlFor="paymentNotes" className="form-label">
            Payment Notes
            <span className="optional-tag">Optional</span>
          </label>
          <textarea
            id="paymentNotes"
            className="form-textarea"
            placeholder="Exam in 6 weeks; can add extra sessions before exam..."
            rows="3"
            value={formData.paymentNotes || ''}
            onChange={(e) => updateField('paymentNotes', e.target.value)}
          />
          <div className="form-hint">
            Any special payment arrangements or notes for tutors
          </div>
        </div>

        {/* Budget Summary */}
        {formData.paymentType && formData.budgetAmount && (
          <div className="budget-summary">
            <h4>💰 Budget Summary</h4>
            <div className="summary-card">
              <div className="summary-main">
                <div className="budget-amount">
                  {formatCurrency(formData.budgetAmount)}
                </div>
                <div className="budget-frequency">
                  per {getPaymentTypeLabel()}
                </div>
              </div>
              
              {formData.paymentType === 'monthly' && formData.daysPerWeek && (
                <div className="budget-breakdown">
                  <div className="breakdown-item">
                    <span>Estimated per session:</span>
                    <span>{formatCurrency(Math.round(formData.budgetAmount / (formData.daysPerWeek * 4)))}</span>
                  </div>
                </div>
              )}
              
              {formData.paymentType === 'hourly' && formData.daysPerWeek && (
                <div className="budget-breakdown">
                  <div className="breakdown-item">
                    <span>Estimated monthly (16h):</span>
                    <span>{formatCurrency(formData.budgetAmount * 16)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {formData.paymentNotes && (
              <div className="payment-notes-preview">
                <strong>Notes:</strong> {formData.paymentNotes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Budget;
