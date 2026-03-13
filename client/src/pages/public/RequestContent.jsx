import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

export default function RequestContent() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // My Requests State
  const [myRequests, setMyRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      setFetchingRequests(true);
      const { data } = await api.get('/requests/my-requests');
      setMyRequests(data.requests);
    } catch (err) {
      console.error("Failed to fetch my requests:", err);
    } finally {
      setFetchingRequests(false);
    }
  };

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
      await api.post('/requests', {
        topic: topic,
        message: message,
        requestedBy: user.id,
      });
      setSuccess('Your request has been submitted successfully!');
      setTopic('');
      setMessage('');
      fetchMyRequests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingScreen text="Please login to continue..." />;

  return (
    <div className="container py-4 fade-in">
      <div className="row g-4">
        {/* Left Side: Submission Form */}
        <div className="col-lg-5">
          <div className="glass-panel p-4 p-md-5 h-100 shadow-sm border-0 rounded-4">
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-megaphone-fill fs-2"></i>
              </div>
              <h3 className="fw-bold text-primary mb-1">Request Content</h3>
              <p className="text-muted small">Can't find what you're looking for?</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-3 py-2 small d-flex align-items-center">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success border-0 shadow-sm rounded-3 py-2 small d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="form-floating mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  id="topic" 
                  placeholder="Topic" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
                <label htmlFor="topic">Topic / Subject</label>
              </div>
              <div className="form-floating mb-4">
                <textarea 
                  className="form-control" 
                  id="message" 
                  placeholder="Details" 
                  style={{ height: '120px' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <label htmlFor="message">Any specific details?</label>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-send-fill me-2"></i>
                )}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: My Request History/Status */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 p-md-5 h-100 shadow-sm border-0 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">Your Requests</h4>
                <p className="text-muted small mb-0">Track the status of your reported topics</p>
              </div>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                {myRequests.length} Total
              </span>
            </div>

            {fetchingRequests ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-5 opacity-50">
                <i className="bi bi-chat-square-text display-1 mb-3 d-block"></i>
                <p className="fw-medium">No requests yet. Submit your first topic today!</p>
              </div>
            ) : (
              <div className="request-scroll-list pe-1" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <div className="list-group list-group-flush gap-3">
                  {myRequests.map((req) => (
                    <div key={req._id} className="list-group-item bg-transparent border rounded-4 p-3 shadow-sm-hover transition-all">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-dark mb-0">{req.topic}</h6>
                        <span className={`badge rounded-pill small ${
                          req.status === 'fulfilled' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {req.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-muted small mb-3 text-wrap-word">
                        {req.message || 'No additional details provided.'}
                      </p>
                      <div className="d-flex align-items-center mt-2 pt-2 border-top border-light opacity-75">
                         <i className="bi bi-calendar3 me-2 small"></i>
                         <small className="font-monospace" style={{ fontSize: '0.7rem' }}>
                           {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
