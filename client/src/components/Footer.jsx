import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const socialLinks = {
    linkedin: 'jainish-dabgar-87474a320',
    github: 'Jainish-2901',
    whatsapp: '+919773272749',
    instagram: 'dabgar_jainish_2901',
    phone: '+919773272749'
  };

  return (
    <footer className="fancy-footer">
      <div className="container">
        <div className="row g-5 mb-5">
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link className="navbar-brand text-nowrap" to="/">
              <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '35px', width: 'auto' }} />GyanStack
            </Link>
            <p className="footer-text pe-lg-4">
              Your ultimate resource hub for BCA/MCA study materials. Simplified learning for complex subjects. We are here to make your academic journey smoother and smarter.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">Explore</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/browse" className="footer-link">Browse Library</Link></li>
              <li><Link to="/request" className="footer-link">Request Content</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Key Features */}
          <div className="col-lg-3 col-md-6">
            <h5 className="footer-title">Features</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li className="footer-text"><i className="bi bi-bookmark-fill text-primary me-2"></i> Smart Save</li>
              <li className="footer-text"><i className="bi bi-cloud-arrow-down-fill text-primary me-2"></i> Direct Downloads</li>
              <li className="footer-text"><i className="bi bi-bell-fill text-primary me-2"></i> Instant Alerts</li>
              <li className="footer-text"><i className="bi bi-shield-check text-primary me-2"></i> 100% Free</li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div className="col-lg-3 col-md-6">
            <h5 className="footer-title">Connect with us</h5>
            <div className="d-flex gap-3 mt-3">
              <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a href={`https://github.com/${socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                <i className="bi bi-github fs-5"></i>
              </a>
              <a href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-link" title="WhatsApp">
                <i className="bi bi-whatsapp fs-5"></i>
              </a>
              <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href={`tel:${socialLinks.phone}`} className="social-link" title="Call Now">
                <i className="bi bi-telephone-fill fs-5"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & Branding Line */}
        <div className="border-top" style={{ borderColor: 'var(--glass-border)' }}></div>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4 text-center">
          <div className="mb-3 mb-md-0">
            <p className="footer-text small mb-1">
              © {new Date().getFullYear()} GyanStack. All Rights Reserved.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <Link to="/privacy" className="footer-link x-small text-muted" style={{ fontSize: '0.75rem' }}>Privacy Policy</Link>
              <Link to="/terms" className="footer-link x-small text-muted" style={{ fontSize: '0.75rem' }}>Terms of Service</Link>
            </div>
          </div>

          <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="footer-link small d-flex align-items-center justify-content-center" title="Developer">
            Designed & Developed with <i className="bi bi-heart-fill text-danger mx-1 heart"></i> by Jainish Dabgar
          </a>
        </div>
      </div>
    </footer>
  );
}