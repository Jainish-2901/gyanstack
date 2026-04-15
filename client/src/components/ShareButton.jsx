import React, { useState } from 'react';

export default function ShareButton({ 
  title, 
  url, 
  className = "btn btn-outline-primary",
  style = {},
  isCircle = true,
  children
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const targetUrl = url || window.location.href;
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;

    const shareData = {
      title: title || 'GyanStack',
      text: title ? `${title} | GyanStack Resources` : 'Check out these resources on GyanStack!',
      url: fullUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        const copyText = title ? `${title}\n${fullUrl}` : fullUrl;
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const finalStyle = isCircle ? {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...style
  } : {
    position: 'relative',
    ...style
  };

  return (
    <button 
      className={className}
      onClick={handleShare}
      title="Share"
      style={finalStyle}
    >
      {children ? children : (
        <i className={`bi ${copied ? 'bi-check2' : 'bi-share-fill'}`} style={{ fontSize: '1rem' }}></i>
      )}
      {copied && (
        <span 
          className="badge bg-dark bg-opacity-75 text-white position-absolute" 
          style={{ 
            top: isCircle ? '-35px' : '-40px', 
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
