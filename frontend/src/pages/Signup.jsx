import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate import kiya
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

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
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create account. Please check inputs.');
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '450px' }}>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-sm-5">
          <h2 className="card-title text-center mb-4 fw-bold fs-3">Create Account</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input type="tel" className="form-control" id="phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <label htmlFor="phone">Phone Number</label>
            </div>
            
            <div className="mb-3">
              <PasswordInput 
                label="Password (min. 6 characters)" 
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