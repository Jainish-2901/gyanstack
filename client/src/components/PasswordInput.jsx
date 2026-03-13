import React, { useState } from 'react';

// Yeh component password field aur toggle button ko handle karta hai
export default function PasswordInput({ label, value, onChange, required = true, isConfirm = false, ...props }) {
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
    <div className="input-group mb-0">
      <div className="form-floating flex-grow-1">
        <input
          type={type}
          className="form-control border-end-0" 
          id={id}
          placeholder={label}
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      <button
        className="btn btn-outline-secondary border-start-0 py-0"
        type="button"
        style={{ borderRadius: '0 0.75rem 0.75rem 0', borderColor: '#dee2e6' }}
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} fs-5`}></i>
      </button>
      
      {/* Strength Indicator */}
      {!isConfirm && strength.text && (
        <div className="w-100 text-start mt-1">
          <small className={`text-${strength.color} fw-bold ms-1`}>
            Strength: {strength.text}
          </small>
        </div>
      )}
    </div>
  );
}