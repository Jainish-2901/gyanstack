import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  // Aapke social media links
  const socialLinks = {
    linkedin: 'jainish-dabgar-87474a320', // Placeholder: Kripya isse badlein
    github: 'Jainish-2901',       // Placeholder: Kripya isse badlein
    whatsapp: '+919773272749' // Placeholder: Kripya isse badlein (e.g., +919876543210)
  };
  
  return (
    // Trust Stats section jaisa dark background istemaal karein
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4">

          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <Link className="navbar-brand fw-bold fs-4 text-primary mb-3 d-block" to="/" style={{ color: '#00c0ff !important' }}>
              <i className="bi bi-stack me-2"></i>GyanStack
            </Link>
            <p className="small text-white-50">
              Your ultimate resource hub for BCA/MCA study materials. Simplified learning for complex subjects.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="fw-bold mb-3 text-warning">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white-50 text-decoration-none small hover-link">Home</Link></li>
              <li><Link to="/browse" className="text-white-50 text-decoration-none small hover-link">Browse Content</Link></li>
              <li><Link to="/dashboard" className="text-white-50 text-decoration-none small hover-link">My Dashboard</Link></li>
              <li><Link to="/settings" className="text-white-50 text-decoration-none small hover-link">Settings</Link></li>
            </ul>
          </div>

          {/* Column 3: Key Features (Aapke liye) */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-3 text-warning">Why Register?</h5>
            <ul className="list-unstyled">
              <li><span className="text-white-50 small"><i className="bi bi-bookmark-fill me-2"></i> Save Topics</span></li>
              <li><span className="text-white-50 small"><i className="bi bi-download me-2"></i> Direct Downloads</span></li>
              <li><span className="text-white-50 small"><i className="bi bi-bell-fill me-2"></i> Instant Updates</span></li>
              <li><span className="text-white-50 small"><i className="bi bi-filter-circle-fill me-2"></i> Advanced Filtering</span></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="fw-bold mb-3 text-warning">Connect</h5>
            <div className="d-flex social-icons">
              {/* LinkedIn */}
              <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-white-50 me-3 social-link" title="LinkedIn">
                <i className="bi bi-linkedin fs-4"></i>
              </a>
              {/* GitHub */}
              <a href={`https://github.com/${socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="text-white-50 me-3 social-link" title="GitHub">
                <i className="bi bi-github fs-4"></i>
              </a>
              {/* WhatsApp */}
              <a href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-white-50 social-link" title="WhatsApp">
                <i className="bi bi-whatsapp fs-4"></i>
              </a>
            </div>
          </div>

        </div>
        
        {/* Copyright & Branding Line */}
        <hr style={{borderColor: 'rgba(255, 255, 255, 0.1)'}}/>
        <div className="text-center small text-white-50">
          © {new Date().getFullYear()} GyanStack. All Rights Reserved.
          <br/>
          <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-white-50 me-3" title="Developer" style={{textDecoration: 'none', fontWeight: 'bold'}}>
            <span className="mt-1 d-block">Designed & Developed with <i className="bi bi-heart-fill text-danger"></i> by Jainish Dabgar</span>
          </a>
        </div>
      </div>
    </footer>
  );
}