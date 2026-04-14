import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { requestForToken, auth, googleProvider, analytics, logEvent } from '../../firebase';
import { signInWithPopup } from "firebase/auth";
import api from '../../services/api';

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
        if (role === 'admin' || role === 'superadmin') {
            logout();
            setError('Staff/Admin accounts cannot log in here. Please use the Admin Portal.');
            setLoading(false);
            return;
        }

        if (analytics) {
          logEvent(analytics, 'login', { method: 'manual' });
        }

        await requestForToken();

        navigate('/dashboard');
    } catch (err) {
        setLoading(false);
        setError(err.message || 'Login failed. Invalid credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const { user: firebaseUser } = result;

        const { data } = await api.post('/auth/google-login', {
            email: firebaseUser.email,
            username: firebaseUser.displayName,
            googleId: firebaseUser.uid,
            profileImage: firebaseUser.photoURL
        });

        const loggedInUser = await login(null, null, data); 

        if (loggedInUser.role !== 'student') {
            logout();
            setError('Admins cannot log in here. Please use the Admin Portal.');
            setLoading(false);
            return;
        }

        if (analytics) {
          logEvent(analytics, 'login', { method: 'google' });
        }

        await requestForToken();
        navigate('/dashboard');
    } catch (err) {
        setLoading(false);
        console.error("Google Auth Error:", err);
        
        if (err.code === 'auth/popup-blocked') {
            setError('Login popup was blocked. Please allow popups for this site.');
        } else if (err.code === 'auth/popup-closed-by-user') {
            setError('Login cancelled by user.');
        } else {
            setError(`Google login failed: ${err.message || 'Please try again.'}`);
        }
    }
  };

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '480px' }}>
      <div className="glass-panel border-0 rounded-4 overflow-hidden shadow-lg">
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-person-workspace text-primary fs-1"></i>
          </div>
          <h2 className="card-title mb-1 fw-bold fs-2 text-primary">Welcome Back</h2>
          <p className="text-secondary mb-4">Log in to access your study materials</p>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="loginId" name="loginId" autoComplete="username" placeholder="Username, Email, or Phone" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
              <label htmlFor="loginId">Username, Email, or Phone</label>
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
            
            <div className="text-end mb-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            
            <div className="d-grid mb-3">
              <button 
                className="btn btn-primary btn-lg" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>

            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1" />
              <span className="mx-3 text-muted small fw-bold">OR</span>
              <hr className="flex-grow-1" />
            </div>

            <div className="d-grid">
              <button 
                type="button" 
                className="btn btn-outline-dark btn-lg border-2 d-flex align-items-center justify-content-center"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="me-2" style={{ width: '20px' }} />
                Sign in with Google
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
