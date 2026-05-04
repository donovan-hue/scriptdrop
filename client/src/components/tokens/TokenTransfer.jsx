import React, { useState } from 'react';
import useTokens from '../../hooks/useTokens';
import './TokenTransfer.css';

const TokenTransfer = () => {
  const { transfer, loading } = useTokens();
  const [formData, setFormData] = useState({
    toUserId: '',
    amount: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.toUserId || !formData.amount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      await transfer(formData.toUserId, parseFloat(formData.amount));
      setMessage(`Successfully transferred ${formData.amount} KRO`);
      setFormData({ toUserId: '', amount: '' });
    } catch (err) {
      setError(err.message || 'Transfer failed');
    }
  };

  return (
    <div className="token-transfer">
      <div className="transfer-container">
        <h2>Transfer Tokens</h2>

        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-group">
            <label htmlFor="toUserId">Recipient User ID</label>
            <input
              type="text"
              id="toUserId"
              name="toUserId"
              value={formData.toUserId}
              onChange={handleChange}
              placeholder="Enter recipient user ID"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (KRO)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>

        <div className="transfer-info">
          <h3>Transfer Information</h3>
          <ul>
            <li>Transfers are instant on the Kronos platform</li>
            <li>You need sufficient balance to complete the transfer</li>
            <li>All transfers are recorded in your transaction history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenTransfer;
