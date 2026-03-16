import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { requestForToken, auth, googleProvider } from '../../firebase';
import { signInWithPopup, getRedirectResult } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import api from '../../services/api';
import { db } from '../../firebase';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // --- HANDLE REDIRECT RESULT ---
  React.useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const { user: firebaseUser } = result;
          
          // 1. Sync Firestore
          await setDoc(doc(db, "users", firebaseUser.uid), {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: 'student',
            lastLogin: serverTimestamp()
          }, { merge: true });

          // 2. Sync MERN
          const { data } = await api.post('/auth/google-login', {
            email: firebaseUser.email,
            username: firebaseUser.displayName,
            googleId: firebaseUser.uid,
            profileImage: firebaseUser.photoURL
          });

          await login(null, null, data);
          await requestForToken();
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Redirect Resolution Error:", err);
        setError("Failed to complete Google Sign-In after redirect.");
      } finally {
          setLoading(false);
      }
    };
    handleRedirect();
  }, [auth, login, navigate]);
  
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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    // Watchdog Timer: If popup hangs for more than 3 seconds on localhost, force redirect
    const watchdog = setTimeout(async () => {
      console.warn("Popup watchdog triggered. Attempting redirect fallback...");
      try {
        const { signInWithRedirect } = await import("firebase/auth");
        await signInWithRedirect(auth, googleProvider);
      } catch (e) {
        console.error("Watchdog redirect failed:", e);
      }
    }, 3000);

    try {
        // --- LOCALHOST OPTIMIZATION ---
        // Force Redirect flow on localhost to completely bypass COOP/Popup policy blocks
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log("Localhost environment detected: Using high-stability Redirect Flow...");
            const { signInWithRedirect } = await import("firebase/auth");
            await signInWithRedirect(auth, googleProvider);
            return; // Exit and wait for redirect to happen
        }

        console.log("Attempting Google Sign-In via Popup...");
        const result = await signInWithPopup(auth, googleProvider);
        clearTimeout(watchdog);
        const { user: firebaseUser } = result;

        // --- 1. Store in Firebase Firestore ---
        await setDoc(doc(db, "users", firebaseUser.uid), {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: 'student',
            lastLogin: serverTimestamp()
        }, { merge: true });

        // --- 2. Send to our MERN backend ---
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

        await requestForToken();
        navigate('/dashboard');
    } catch (err) {
        clearTimeout(watchdog);
        setLoading(false);
        console.warn("Google Auth error caught:", err.code, err.message);
        
        // Handle explicit COOP or policy errors immediately
        const isCOOPError = err.message?.toLowerCase().includes('cross-origin-opener-policy') || 
                          err.message?.toLowerCase().includes('window.close') ||
                          err.code === 'auth/internal-error';
        
        const shouldRedirect = err.code === 'auth/popup-blocked' || 
                             err.code === 'auth/cancelled-popup-request' || 
                             isCOOPError;

        if (shouldRedirect || window.location.hostname === 'localhost') {
            console.log("Localhost or Policy block detected: Switching to Redirect Flow...");
            try {
                const { signInWithRedirect } = await import("firebase/auth");
                await signInWithRedirect(auth, googleProvider);
            } catch (redirErr) {
                console.error("Critical: Redirect Flow failed:", redirErr);
                setError('Login failed. Please refresh and try again.');
            }
        } else {
            console.error("Unhandleable Auth Error:", err);
            setError(`Login failed: ${err.message || 'Please try again.'}`);
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
