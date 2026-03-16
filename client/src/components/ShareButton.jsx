import React, { useState } from 'react';

export default function ShareButton({ title, url, className = "btn btn-light rounded-circle shadow-sm" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // If no URL is provided, default to current page's full URL
    const targetUrl = url || window.location.href;
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: fullUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Could not copy link to clipboard.');
      }
    }
  };

  return (
    <button 
      className={className}
      onClick={handleShare}
      title="Share"
      style={{ position: 'relative' }}
    >
      <i className={`bi ${copied ? 'bi-check2' : 'bi-share-fill'}`}></i>
      {copied && (
        <span 
          className="badge bg-dark bg-opacity-75 text-white position-absolute" 
          style={{ 
            top: '-30px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '10px'
          }}
        >
          Copied!
        </span>
      )}
    </button>
  );
}
