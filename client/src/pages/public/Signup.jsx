import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate import kiya
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { requestForToken } from '../../firebase';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password field
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate(); // <-- Yahaan navigate hook use kiya

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) { // Check karein ki password match karte hain
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      await register(username, email, phone, password);
      
      // --- PUSH NOTIFICATION PERMISSION ---
      await requestForToken();

      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create account. Please check inputs.');
    }
  };

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '500px' }}>
      <div className="glass-panel border-0 rounded-4 overflow-hidden shadow-lg">
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="mb-4 d-inline-block p-3 rounded-circle bg-success bg-opacity-10">
            <i className="bi bi-person-plus-fill text-success fs-1"></i>
          </div>
          <h2 className="card-title mb-1 fw-bold fs-2 text-primary">Create Account</h2>
          <p className="text-secondary mb-4">Join our community of learners today</p>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="username" name="username" autoComplete="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="email" name="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input type="tel" className="form-control" id="phone" name="phone" autoComplete="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <label htmlFor="phone">Phone Number</label>
            </div>
            
            <div className="mb-3">
              <PasswordInput 
                label="Password (min. 6 characters)" 
                name="password"
                autoComplete="new-password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <PasswordInput 
                label="Confirm Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="d-grid">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <small>
              Already have an account? <Link to="/login">Log in here</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
