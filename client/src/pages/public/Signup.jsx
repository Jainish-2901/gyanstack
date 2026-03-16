import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { requestForToken, auth, googleProvider, analytics, logEvent } from '../../firebase';
import { signInWithPopup } from "firebase/auth";
import api from '../../services/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      await register(username, email, phone, password);
      
      // --- ANALYTICS: Sign Up Event ---
      if (analytics) {
        logEvent(analytics, 'sign_up', { method: 'manual' });
      }

      await requestForToken();
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create account. Please check inputs.');
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
            setError('Admins cannot register here.');
            setLoading(false);
            return;
        }

        // --- ANALYTICS: Sign Up Event ---
        if (analytics) {
          logEvent(analytics, 'sign_up', { method: 'google' });
        }

        await requestForToken();
        navigate('/dashboard');
    } catch (err) {
        console.error("Google Auth Error:", err);
        setError('Google Sign-In failed.');
        setLoading(false);
    }
  };

  return (
    <div className="container py-4 fade-in" style={{ maxWidth: '500px' }}>
      <div className="glass-panel border-0 rounded-4 overflow-hidden shadow-lg">
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" style={{ width: '80px', height: '80px' }}>
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
            
            <div className="d-grid mb-3">
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
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
                Sign up with Google
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
