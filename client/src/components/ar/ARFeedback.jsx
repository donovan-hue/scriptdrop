import React, { useState } from 'react';
import { useAR } from '../../hooks/useAR';
import './ARFeedback.css';

const ARFeedback = ({ sessionId, onComplete }) => {
  const { submitFeedback, loading } = useAR();
  const [formData, setFormData] = useState({
    fit: '',
    comfort: 3,
    style: 3,
    likelihood: 0.5,
    wouldBuy: false,
    comments: '',
    purchaseDecision: 'will-decide-later'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitFeedback(sessionId, formData);
    if (result) {
      onComplete?.();
    }
  };

  return (
    <div className="ar-feedback">
      <h3>What do you think?</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>How's the fit?</label>
          <select name="fit" value={formData.fit} onChange={handleChange}>
            <option value="">Select fit</option>
            <option value="too-small">Too small</option>
            <option value="perfect">Perfect</option>
            <option value="too-big">Too big</option>
          </select>
        </div>

        <div className="form-group">
          <label>Comfort: {formData.comfort}/5</label>
          <input
            type="range"
            name="comfort"
            min="1"
            max="5"
            value={formData.comfort}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Style: {formData.style}/5</label>
          <input
            type="range"
            name="style"
            min="1"
            max="5"
            value={formData.style}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="wouldBuy"
              checked={formData.wouldBuy}
              onChange={handleChange}
            />
            I would buy this
          </label>
        </div>

        <div className="form-group">
          <label>Likely to purchase: {Math.round(formData.likelihood * 100)}%</label>
          <input
            type="range"
            name="likelihood"
            min="0"
            max="1"
            step="0.1"
            value={formData.likelihood}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Decision</label>
          <select name="purchaseDecision" value={formData.purchaseDecision} onChange={handleChange}>
            <option value="will-decide-later">Will decide later</option>
            <option value="interested">Interested</option>
            <option value="not-interested">Not interested</option>
          </select>
        </div>

        <div className="form-group">
          <label>Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            placeholder="Any additional thoughts?"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default ARFeedback;
