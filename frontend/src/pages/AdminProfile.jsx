import React, { useState } from 'react';
import api from '../services/api'; // API use karein
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RequestContent() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to make a request.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Backend API call
      await api.post('/requests', {
        topic: topic,
        message: message,
        requestedBy: user.id, // MongoDB user ID
      });
      setSuccess('Your request has been submitted successfully!');
      setTopic('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-sm-5">
          <h1 className="display-5 fw-bold mb-4 text-center">Request Content</h1>
          <p className="lead text-center mb-4">
            Agar aapko kisi specific topic par notes chahiye, toh neeche form bharein.
          </p>
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input 
                type="text" 
                className="form-control" 
                id="topic" 
                placeholder="e.g., BCA Sem 4 Python" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
              <label htmlFor="topic">Topic / Subject</label>
            </div>
            <div className="form-floating mb-3">
              <textarea 
                className="form-control" 
                id="message" 
                placeholder="Details" 
                style={{ height: '100px' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <label htmlFor="message">Details (optional)</label>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}