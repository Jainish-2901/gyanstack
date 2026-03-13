import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ResetPasswordForm from '../../components/ResetPasswordForm.jsx'; // Component for OTP verification

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP/Reset
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPasswordRequest } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Backend ko email bhejein aur OTP generate karne ko kahein
      await forgotPasswordRequest(email); 
      setStep(2); // OTP verification step par jaayein
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check your email or try again.');
    }
    setLoading(false);
  };

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: '480px' }}>
      <div className="glass-panel border-0 rounded-4 overflow-hidden shadow-lg">
        <div className="card-body p-4 p-sm-5 text-center">
          <div className="mb-4 d-inline-block p-3 rounded-circle bg-info bg-opacity-10">
            <i className="bi bi-shield-lock text-info fs-1"></i>
          </div>
          <h2 className="card-title mb-1 fw-bold fs-2 text-primary">
            {step === 1 ? 'Recover Password' : 'Verify Identity'}
          </h2>

          {step === 1 && (
            <>
              <p className="text-center text-muted mb-4">Enter your email to receive an OTP.</p>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleEmailSubmit}>
                <div className="form-floating mb-4">
                  <input type="email" className="form-control" id="resetEmail" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <label htmlFor="resetEmail">Email address</label>
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <ResetPasswordForm email={email} onDone={() => setStep(3)} />
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="alert alert-success">Password has been reset successfully!</div>
              <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
            </div>
          )}
          
          <div className="text-center mt-4">
            <small><Link to="/login">Back to Login</Link></small>
          </div>
        </div>
      </div>
    </div>
  );
}
