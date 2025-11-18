import React from 'react';

export default function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 fs-5">{text}</p>
    </div>
  );
}