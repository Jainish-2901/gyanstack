import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput'; // Is component ko hum reuse kar rahe hain

export default function Login() {
  const [loginId, setLoginId] = new useState('');
  const [password, setPassword] = new useState('');
  const [error, setError] = new useState('');
  const [loading, setLoading] = new useState(false);
  
  const { login } = useAuth();
  const navigate = new useNavigate();
  
  const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Assume login function calls the API and returns the user object (with role)
            const loggedInUser = await login(loginId, password); 
            
            // --- UPDATED REDIRECTION LOGIC ---
            const role = loggedInUser?.role; 

            if (role === 'superadmin') {
                navigate('/super-admin-panel');
            } else if (role === 'admin') {
                // Admin Content/Upload page par jayega
                navigate('/admin-panel'); 
            } else {
                // Default role 'student' ya koi bhi general user dashboard par jayega
                navigate('/dashboard');
            }
            // --- END NEW REDIRECTION LOGIC ---

        } catch (err) {
            setLoading(false);
            // AuthContext से आया हुआ error message
            setError(err.message || 'Login failed. Invalid credentials.');
        }
    };

  return (
    <div className="container fade-in" style={{ maxWidth: '450px' }}>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-sm-5">
          <h2 className="card-title text-center mb-4 fw-bold fs-3">Log In</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="loginId" placeholder="Username, Email, or Phone" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
              <label htmlFor="loginId">Username, Email, or Phone</label>
            </div>
            
            <div className="mb-3">
              <PasswordInput 
                label="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                isConfirm={true} /* <-- FIX YAHIN HAI (Yeh Strength ko chhupa dega) */
              />
            </div>
            
            <div className="text-end mb-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            
            <div className="d-grid">
              <button 
                className="btn btn-primary btn-lg" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <small>
              Don't have an account? <Link to="/signup">Sign up here</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}