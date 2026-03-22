import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth(); // Ensure this matches your AuthContext export

  const socialLinks = {
    linkedin: 'jainish-dabgar-87474a320',
    github: 'Jainish-2901',
    whatsapp: '+919773272749',
    instagram: 'dabgar_jainish_2901',
    phone: '+919773272749'
  };

  const features = [
    { icon: 'bi-lightning-charge-fill', title: 'Fast Access', desc: 'Instant downloads', color: 'text-primary' },
    { icon: 'bi-shield-check', title: 'Verified', desc: 'Curated materials', color: 'text-success' },
    { icon: 'bi-people-fill', title: 'Community', desc: 'Student-driven', color: 'text-info' },
    { icon: 'bi-currency-exchange', title: 'Always Free', desc: 'Open education', color: 'text-warning' }
  ];

  return (
    <footer className="fancy-footer mt-5">
      <div className="container pt-5">

        {/* --- 1. FEATURES BAR (Centered & Fully Visible) --- */}
        <div className="row justify-content-center g-4 mb-5 pb-5 border-bottom border-opacity-10 mx-auto" style={{ maxWidth: '1100px' }}>
          {features.map((feature, idx) => (
            <div key={idx} className="col-6 col-lg-3">
              <div className="d-flex flex-column flex-md-row align-items-center text-center text-md-start gap-2 gap-md-3 h-100 justify-content-center">
                <i className={`bi ${feature.icon} ${feature.color} fs-3`}></i>
                <div className="overflow-hidden">
                  <h6 className="mb-0 fw-bold small text-dark">{feature.title}</h6>
                  <p className="text-muted extra-small mb-0" style={{ fontSize: '0.7rem' }}>{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- 2. MAIN FOOTER CONTENT --- */}
        <div className="row g-5 mb-5 text-center text-lg-start justify-content-center">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-12">
            <Link className="navbar-brand d-inline-flex align-items-center mb-3" to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '35px' }} />
              <span className="fw-bold fs-4">GyanStack</span>
            </Link>
            <p className="footer-text mb-4 opacity-75 pe-lg-4 mx-auto mx-lg-0" style={{ maxWidth: '400px' }}>
              Your universal academic library. Empowering students with
              organized, high-quality resources for a brighter technical future.
            </p>
          </div>

          {/* Links Grid */}
          <div className="col-lg-5 col-md-12">
            <div className="row g-4 justify-content-center">
              <div className="col-6 col-sm-6">
                <h6 className="footer-title small text-uppercase fw-bold mb-4 tracking-wider">Explore</h6>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  <li><Link to="/browse" className="footer-link small">Browse Library</Link></li>
                  <li><Link to="/request" className="footer-link small">Request Content</Link></li>
                  {/* Dynamic Student Link */}
                  <li>
                    <Link to={user ? "/dashboard" : "/login"} className="footer-link small fw-bold text-primary">
                      {user ? 'My Dashboard' : 'Student Login'}
                    </Link>
                  </li>
                  <li><Link to="/about" className="footer-link small">Our Mission</Link></li>
                </ul>
              </div>
              <div className="col-6 col-sm-6">
                <h6 className="footer-title small text-uppercase fw-bold mb-4 tracking-wider">Support</h6>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  <li><Link to="/contact" className="footer-link small">Contact Us</Link></li>
                  <li><Link to="/privacy" className="footer-link small">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="footer-link small">Terms of Service</Link></li>
                  {user && <li><Link to="/dashboard/saved" className="footer-link small">Saved Items</Link></li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Connect Section */}
          <div className="col-lg-3 col-md-12">
            <h6 className="footer-title small text-uppercase fw-bold mb-4 tracking-wider">Connect</h6>
            <div className="d-flex gap-2 justify-content-center justify-content-lg-start mb-4">
              <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noreferrer" className="social-link-sm"><i className="bi bi-linkedin"></i></a>
              <a href={`https://github.com/${socialLinks.github}`} target="_blank" rel="noreferrer" className="social-link-sm"><i className="bi bi-github"></i></a>
              <a href={`https://wa.me/${socialLinks.whatsapp}`} target="_blank" rel="noreferrer" className="social-link-sm"><i className="bi bi-whatsapp"></i></a>
              <a href={`tel:${socialLinks.phone}`} className="social-link-sm"><i className="bi bi-telephone-fill"></i></a>
            </div>

            {/* Dynamic Button Color & Text */}
            <Link to={user ? "/dashboard" : "/login"} className={`btn btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm w-100 w-lg-auto ${user ? 'btn-success' : 'btn-primary'}`}>
              <i className={`bi ${user ? 'bi-grid-fill' : 'bi-person-circle'} me-2`}></i>
              {user ? 'Open Dashboard' : 'Student Portal'}
            </Link>
          </div>
        </div>

        {/* --- 3. BOTTOM BAR --- */}
        <div className="py-4 border-top border-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-center text-md-start">
          <div className="text-muted extra-small">
            © {new Date().getFullYear()} <span className="fw-bold text-primary">GyanStack</span>.
            Built for students, by students.
          </div>
          <div className="d-flex align-items-center">
            <a href={`https://www.linkedin.com/in/${socialLinks.linkedin}`} target="_blank" rel="noreferrer"
              className="footer-link x-small d-flex align-items-center text-decoration-none" title="Developer">
              Designed with <i className="bi bi-heart-fill text-danger mx-1 heart"></i> by Jainish Dabgar
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .fancy-footer { background: var(--glass-bg); backdrop-filter: blur(20px); border-top: 1px solid var(--glass-border); }
        .footer-title { color: var(--primary); font-size: 0.75rem; letter-spacing: 1.5px; }
        .footer-link { color: var(--text-secondary); text-decoration: none; transition: all 0.2s ease; }
        .footer-link:hover { color: var(--primary); transform: translateX(4px); }
        
        .social-link-sm {
          width: 38px; height: 38px; border-radius: 12px; background: rgba(99, 102, 241, 0.08);
          color: var(--primary); display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease; text-decoration: none; font-size: 1.1rem;
        }
        .social-link-sm:hover { background: var(--primary); color: white; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2); }
        
        .extra-small { font-size: 0.75rem; }
        .x-small { font-size: 0.8rem; }
        .heart { display: inline-block; animation: heartbeat 1.5s infinite; }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @media (max-width: 768px) {
          .footer-title { margin-bottom: 1.2rem !important; }
        }
      `}</style>
    </footer>
  );
}