import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, fadeInUp } from '../../utils/animations';

const LAST_UPDATED = 'April 14, 2026';
const APP_NAME = 'GyanStack';
const APP_URL = 'https://gyanstack.vercel.app';
const CONTACT_EMAIL = 'jainishdabgar2901@gmail.com';

const Section = ({ icon, title, children }) => (
  <motion.div 
    variants={fadeInUp}
    className="mb-5"
  >
    <h2 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>
      <span className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{ width: 38, height: 38, background: 'rgba(16, 185, 129, 0.1)' }}>
        <i className={`bi ${icon} text-success`} style={{ fontSize: '1rem' }}></i>
      </span>
      {title}
    </h2>
    <div className="text-muted" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
      {children}
    </div>
  </motion.div>
);

export default function PrivacyPolicy() {
  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}
    >
      {/* Hero */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container py-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="d-flex align-items-center gap-2 mb-3 text-muted small"
          >
            <Link to="/" className="text-decoration-none text-muted transition-all hover-primary">Home</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
            <span className="text-primary fw-medium">Privacy Policy</span>
          </motion.div>
          
          <div className="d-flex align-items-center gap-3 mb-2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-4 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)' }}
            >
              <i className="bi bi-shield-lock-fill text-white fs-4"></i>
            </motion.div>
            <div>
              <h1 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2.25rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
              <p className="text-muted mb-0 small d-flex align-items-center gap-1">
                <i className="bi bi-clock-history"></i> Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ maxWidth: 620, fontSize: '1rem', lineHeight: '1.6' }}>
            At {APP_NAME}, we prioritize your privacy. This policy details how we handle your data to provide 
            the best educational experience while keeping your information secure.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-panel rounded-4 p-4 p-md-5 shadow-sm border-0" 
                 style={{ backdropFilter: 'blur(20px)', background: 'var(--glass-bg)' }}>

              <Section icon="bi-info-circle" title="1. Who We Are">
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>{APP_NAME}</strong> is a dedicated 
                  resource hub for CS students. We provide study materials with a focus on ease of access 
                  and academic excellence.
                </p>
                <div className="p-3 rounded-3 mb-2" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)' }}>
                  <p className="mb-1 fw-medium text-dark small">Contact Details:</p>
                  <p className="mb-0 small">
                    <i className="bi bi-globe me-2 text-primary"></i><a href={APP_URL} className="text-decoration-none text-primary">{APP_URL}</a><br />
                    <i className="bi bi-envelope me-2 text-primary"></i><a href={`mailto:${CONTACT_EMAIL}`} className="text-decoration-none text-primary">{CONTACT_EMAIL}</a>
                  </p>
                </div>
              </Section>

              <Section icon="bi-database" title="2. Information We Collect">
                <div className="space-y-4">
                  <div className="mb-3 d-flex align-items-start gap-3">
                    <div className="p-2 rounded-2 bg-light"><i className="bi bi-person-badge text-primary"></i></div>
                    <div>
                      <p className="fw-bold text-dark mb-1">a) Account & Profile</p>
                      <p className="small mb-0">When you register or use Google Sign-In, we store your name, email, profile image URL, and account preferences.</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 d-flex align-items-start gap-3">
                    <div className="p-2 rounded-2 bg-light"><i className="bi bi-robot text-primary"></i></div>
                    <div>
                      <p className="fw-bold text-dark mb-1">b) AI Chatbot Interaction</p>
                      <p className="small mb-0">To improve our academic support, our AI Chatbot may process your queries. These interactions are logged to provide context and improve response quality.</p>
                    </div>
                  </div>

                  <div className="mb-3 d-flex align-items-start gap-3">
                    <div className="p-2 rounded-2 bg-light"><i className="bi bi-cloud-arrow-down text-primary"></i></div>
                    <div>
                      <p className="fw-bold text-dark mb-1">c) Notification Sync</p>
                      <p className="small mb-0">To keep you updated across devices, we store your unique <strong className="text-dark">FCM Token</strong> and <strong className="text-dark">lastReadAnnId</strong>.</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-2 bg-light"><i className="bi bi-bar-chart-line text-primary"></i></div>
                    <div>
                      <p className="fw-bold text-dark mb-1">d) Usage Analytics</p>
                      <p className="small mb-0">We track content views and downloads to improve resource visibility. This data is for internal optimization only.</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section icon="bi-google" title="3. Google Authentication">
                <p>
                  We utilize <strong className="text-dark">Google OAuth 2.0</strong> for seamless access. 
                  We only request your name and email. Your Google account password remains strictly 
                  with Google and is never shared with {APP_NAME}.
                </p>
                <div className="alert alert-info border-0 rounded-3 small">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Manage your app permissions anytime at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="alert-link">Google Account Settings</a>.
                </div>
              </Section>

              <Section icon="bi-cpu" title="4. How We Process Data">
                <p>Your data powers key features including:</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check2-circle text-success me-2"></i>Personalized "Saved" library across devices</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-success me-2"></i>Real-time academic support via AI Chat</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-success me-2"></i>Cross-device notification read-state sync</li>
                  <li className="mb-2"><i className="bi bi-check2-circle text-success me-2"></i>Quality monitoring of academic resources</li>
                </ul>
              </Section>

              <Section icon="bi-lock" title="5. Security Measures">
                <div className="row g-2">
                  {[
                    { text: "Bcrypt Salting & Hashing", icon: "bi-hash" },
                    { text: "JWT Encrypted Tokens", icon: "bi-key" },
                    { text: "IP-Restricted Cloud", icon: "bi-cloud-check" }
                  ].map((item, i) => (
                    <div className="col-12" key={i}>
                      <div className="p-2 px-3 rounded-2 bg-light border-0 small d-flex align-items-center gap-2">
                        <i className={`bi ${item.icon} text-success`}></i>
                        <span className="text-dark fw-medium lh-1">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon="bi-person-gear" title="6. Your Rights">
                <p>You have full control over your data. You may request to:</p>
                <div className="row g-3">
                  <div className="col-6 col-sm-4">
                    <div className="p-3 text-center rounded-3 bg-light transition-all hover-lift">
                      <i className="bi bi-eye d-block mb-1 text-primary"></i> <span className="small">Access</span>
                    </div>
                  </div>
                  <div className="col-6 col-sm-4">
                    <div className="p-3 text-center rounded-3 bg-light transition-all hover-lift">
                      <i className="bi bi-pencil d-block mb-1 text-primary"></i> <span className="small">Correct</span>
                    </div>
                  </div>
                  <div className="col-12 col-sm-4">
                    <div className="p-3 text-center rounded-3 border border-danger-subtle text-danger bg-danger-soft transition-all hover-lift">
                      <i className="bi bi-trash d-block mb-1"></i> <span className="small">Delete</span>
                    </div>
                  </div>
                </div>
              </Section>

              <Section icon="bi-envelope-heart" title="7. Contact Us">
                <p className="mb-4">
                  Need to discuss your privacy? Our team is ready to help clarify any concerns.
                </p>
                <div className="d-grid">
                  <Link to="/contact" className="btn btn-primary rounded-pill py-2 fw-bold shadow-sm">
                    Contact Privacy Team
                  </Link>
                </div>
              </Section>

              {/* Bottom Nav */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="d-flex flex-wrap gap-2 pt-4 border-top mt-4" 
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <Link to="/terms" className="btn btn-nav-light btn-sm rounded-pill px-3 py-2">
                  <i className="bi bi-file-text me-1"></i>Terms
                </Link>
                <Link to="/" className="btn btn-nav-light btn-sm rounded-pill px-3 py-2">
                  <i className="bi bi-house me-1"></i>Home
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-primary:hover { color: var(--primary) !important; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .bg-danger-soft { background: rgba(220, 53, 69, 0.05); }
        .btn-nav-light {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        .btn-nav-light:hover {
          background: var(--primary);
          color: white !important;
          border-color: var(--primary);
          transform: translateY(-2px);
        }
      `}</style>
    </motion.div>
  );
}
