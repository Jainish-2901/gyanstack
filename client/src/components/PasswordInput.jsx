import React, { useState } from 'react';

// Yeh component password field aur toggle button ko handle karta hai
export default function PasswordInput({ label, value, onChange, required = true, isConfirm = false }) {
  const [showPassword, setShowPassword] = new useState(false);
  const type = showPassword ? 'text' : 'password';

  // Password strength check (Simple logic)
  const getPasswordStrength = (p) => {
    if (p.length === 0) return { text: '', color: 'muted' };
    
    let strength = 0;
    if (p.length >= 8) strength += 1;
    if (p.match(/[a-z]/)) strength += 1;
    if (p.match(/[A-Z]/)) strength += 1;
    if (p.match(/[0-9]/)) strength += 1;
    if (p.match(/[^a-zA-Z0-9]/)) strength += 1;

    if (strength === 0) return { text: '', color: 'muted' };
    if (strength <= 2) return { text: 'Weak', color: 'danger' };
    if (strength <= 4) return { text: 'Medium', color: 'warning' };
    return { text: 'Strong', color: 'success' };
  };

  const strength = getPasswordStrength(value);
  const id = label.replace(/\s/g, ''); // Generate unique ID

  return (
    <div className="form-floating input-group">
      <input
        type={type}
        className="form-control" 
        id={id}
        placeholder={label}
        value={value}
        onChange={onChange}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
      <button
        className="btn btn-outline-secondary"
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
      </button>
      
      {/* Strength Indicator (Check karein ki yeh Confirm Password nahi hai) */}
      {!isConfirm && strength.text && (
        <small className={`text-${strength.color} fw-bold ms-1 w-100`}>
          Strength: {strength.text}
        </small>
      )}
    </div>
  );
}