import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from './PasswordInput';

export default function ResetPasswordForm({ email, onDone }) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword, forgotPasswordRequest } = useAuth();

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  const handleResendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);
    setError('');
    
    try {
      await forgotPasswordRequest(email); 
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(otp, newPassword);
      onDone();
    } catch (err) {
      setError(err.message || 'Reset failed. Invalid or expired OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="alert alert-warning text-center">
        OTP sent to: <span className="fw-bold">{email}</span>. Check your inbox/spam folder.
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-floating mb-3">
          <input type="text" className="form-control" id="otp" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <label htmlFor="otp">Enter OTP (6 digits)</label>
        </div>
        
        <div className="mb-4">
          <PasswordInput
            label="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        
        <div className="d-grid">
          <button className="btn btn-success btn-lg" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
        
        {/* Resend OTP Section */}
        <div className="text-center mt-3">
          <button 
            type="button" 
            className="btn btn-link" 
            onClick={handleResendOtp}
            disabled={!canResend}
          >
            {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
          </button>
        </div>
      </form>
    </div>
  );
}