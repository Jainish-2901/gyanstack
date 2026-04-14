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
        
        const role = loggedInUser?.role; 
        if (role !== 'admin' && role !== 'superadmin') {
            logout();
            setError('Unauthorized. Only Admin and SuperAdmin accounts can log in here.');
            setLoading(false);
            return;
        }

        await requestForToken();

        if (role === 'superadmin') {
            navigate('/dashboard/admin');
        } else {
            navigate('/dashboard/admin');
        }
    } catch (err) {
        setLoading(false);
        setError(err.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="container fade-in" style={{ maxWidth: '480px' }}>
        <div className="glass-panel border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="card-body p-4 p-sm-5 text-center">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-shield-lock-fill text-warning fs-1"></i>
            </div>
            <h2 className="card-title mb-1 fw-bold fs-2 text-primary">Admin Portal</h2>
            <p className="text-secondary mb-4">Secure access for staff and moderators</p>
            
            {error && <div className="alert alert-danger text-start small">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input type="text" className="form-control bg-white" id="loginId" name="loginId" autoComplete="username" placeholder="Username, Email, or Phone" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
                <label htmlFor="loginId" className='text-muted'>Username, Email, or Phone</label>
              </div>
              
              <div className="mb-3">
                <PasswordInput 
                  label="Password" 
                  name="password"
                  autoComplete="current-password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  isConfirm={true}
                />
              </div>
              
              <div className="text-end mb-4">
                <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>Forgot Password?</Link>
              </div>
              
              <div className="d-grid">
                <button 
                  className="btn btn-primary btn-lg rounded-pill fw-bold" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying...
                    </>
                  ) : 'Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
