import React, { useState } from 'react';

export default function ShareButton({ 
  title, 
  url, 
  className = "btn btn-outline-primary",
  style = {}
}) {
  const [copied, setCopied] = useState(false);

  // Helper to fetch logo and give it a descriptive name
  const fetchLogoAsFile = async (descriptiveName) => {
    try {
      const response = await fetch('/maskable-icon-v2.png');
      const blob = await response.blob();
      // Sanitize name for filename
      const safeName = descriptiveName ? descriptiveName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'gyanstack';
      return new File([blob], `${safeName}_share.png`, { type: 'image/png' });
    } catch (error) {
      console.error('Error fetching logo for sharing:', error);
      return null;
    }
  };

  const handleShare = async () => {
    const targetUrl = url || window.location.href;
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
    
    // Detect if we are on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    let shareData = {
      title: title || 'GyanStack',
      text: title ? `${title} | GyanStack Resources` : 'Check out these resources on GyanStack!',
      url: fullUrl,
    };

    if (navigator.share) {
      try {
        if (isMobile) {
          const logoFile = await fetchLogoAsFile(title);
          if (logoFile && navigator.canShare && navigator.canShare({ files: [logoFile] })) {
            shareData.files = [logoFile];
          }
        }
        
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

  // Perfect circle styling essentials
  const circleStyle = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...style
  };

  return (
    <button 
      className={className}
      onClick={handleShare}
      title="Share"
      style={circleStyle}
    >
      <i className={`bi ${copied ? 'bi-check2' : 'bi-share-fill'}`} style={{ fontSize: '1rem' }}></i>
      {copied && (
        <span 
          className="badge bg-dark bg-opacity-75 text-white position-absolute" 
          style={{ 
            top: '-35px', 
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
