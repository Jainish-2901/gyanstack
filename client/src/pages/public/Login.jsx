import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { requestForToken } from '../../firebase';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const loggedInUser = await login(loginId, password); 
        
        // --- CLIENT LOGIC: ONLY STUDENTS ALLOWED ---
        const role = loggedInUser?.role;
        if (role === 'admin' || role === 'superadmin') {
            logout();
            setError('Staff/Admin accounts cannot log in here. Please use the Admin Portal.');
            setLoading(false);
            return;
        }

        // --- PUSH NOTIFICATION PERMISSION ---
        await requestForToken();

        navigate('/dashboard');
    } catch (err) {
        setLoading(false);
        setError(err.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '450px' }}>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-sm-5">
          <h2 className="card-title text-center mb-4 fw-bold fs-3">Student Log In</h2>
          
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
                isConfirm={true}
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
