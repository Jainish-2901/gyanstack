import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, fadeInUp } from '../../utils/animations';

const LAST_UPDATED = 'April 16, 2026';
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
        style={{ width: 38, height: 38, background: 'rgba(99, 102, 241, 0.1)' }}>
        <i className={`bi ${icon} text-primary`} style={{ fontSize: '1rem' }}></i>
      </span>
      {title}
    </h2>
    <div className="text-muted" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
      {children}
    </div>
  </motion.div>
);

export default function TermsOfService() {
  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}
    >
      {/* Hero */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container py-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="d-flex align-items-center gap-2 mb-3 text-muted small"
          >
            <Link to="/" className="text-decoration-none text-muted transition-all hover-primary">Home</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
            <span className="text-primary fw-medium">Terms of Service</span>
          </motion.div>
          
          <div className="d-flex align-items-center gap-3 mb-2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-4 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
            >
              <i className="bi bi-file-earmark-text-fill text-white fs-4"></i>
            </motion.div>
            <div>
              <h1 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2.25rem', letterSpacing: '-0.02em' }}>Terms of Service</h1>
              <p className="text-muted mb-0 small d-flex align-items-center gap-1">
                <i className="bi bi-clock-history"></i> Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ maxWidth: 620, fontSize: '1rem', lineHeight: '1.6' }}>
            Welcome to {APP_NAME}. By using our platform, you agree to comply with our rules designed to maintain 
            a high-quality academic environment.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-panel rounded-4 p-4 p-md-5 shadow-sm border-0" 
                 style={{ backdropFilter: 'blur(20px)', background: 'var(--glass-bg)' }}>

              <Section icon="bi-check-circle" title="1. Agreement to Terms">
                <p className="mb-0">
                  By accessing <strong className="text-dark">{APP_NAME}</strong>, you accept these terms in full. 
                  If you are using the platform on behalf of an institution, you represent that you have the authority 
                  to bind that institution to these terms.
                </p>
              </Section>

              <Section icon="bi-person-plus" title="2. Account Ownership">
                <p>To access premium academic resources, you must create a profile. You agree to:</p>
                <ul>
                  <li>Maintain the confidentiality of your credentials.</li>
                  <li>Provide accurate academic/profile information.</li>
                  <li>Be responsible for all interactions performed under your account.</li>
                  <li>Agree to receive essential <strong>System Communications</strong> regarding platform updates and academic alerts.</li>
                </ul>
              </Section>

              <Section icon="bi-robot" title="3. AI Study Buddy — Acceptable Use">
                <p>Our platform includes <strong>GyanStack AI</strong>, an AI-powered Study Buddy for academic assistance. You can use it to:</p>
                <ul className="list-unstyled mb-3 small">
                  <li className="mb-1 d-flex align-items-center gap-2"><i className="bi bi-check2-circle text-success"></i><span>Find documents by exact or partial name</span></li>
                  <li className="mb-1 d-flex align-items-center gap-2"><i className="bi bi-check2-circle text-success"></i><span>Generate structured study notes from library content</span></li>
                  <li className="mb-1 d-flex align-items-center gap-2"><i className="bi bi-check2-circle text-success"></i><span>Create practice questions (MCQ / short answer)</span></li>
                  <li className="mb-1 d-flex align-items-center gap-2"><i className="bi bi-check2-circle text-success"></i><span>Look up who uploaded a resource</span></li>
                  <li className="mb-1 d-flex align-items-center gap-2"><i className="bi bi-check2-circle text-success"></i><span>Submit content requests to the admin team</span></li>
                </ul>
                <p>You agree to use the Study Buddy responsibly:</p>
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <ul className="list-unstyled mb-0 small">
                    <li className="mb-2 d-flex align-items-center gap-2">
                       <i className="bi bi-shield-exclamation text-danger"></i>
                       <span><strong>No Abuse:</strong> No harassment, hate speech, or offensive prompts.</span>
                    </li>
                    <li className="mb-2 d-flex align-items-center gap-2">
                       <i className="bi bi-slash-circle text-danger"></i>
                       <span><strong>No Spam:</strong> No flooding the bot with repetitive or non-academic queries.</span>
                    </li>
                    <li className="mb-0 d-flex align-items-center gap-2">
                       <i className="bi bi-mortarboard text-success"></i>
                       <span><strong>Academic Focus:</strong> The AI is strictly for educational purposes on GyanStack.</span>
                    </li>
                  </ul>
                </div>
                <p className="small text-muted italic">Misuse of the AI Study Buddy may lead to immediate account suspension.</p>
              </Section>

              <Section icon="bi-shield-shaded" title="4. Prohibited Activities">
                <p>You may NOT use {APP_NAME} to:</p>
                <div className="row g-2">
                  {[
                    { text: "Scrape or automated data mining", icon: "bi-bug" },
                    { text: "Distribute unauthorized materials", icon: "bi-file-earmark-lock" },
                    { text: "Attempt server-side exploits", icon: "bi-terminal-x" },
                    { text: "Impersonate staff or faculty", icon: "bi-person-workspace" },
                    { text: "Upload malicious code", icon: "bi-virus" }
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div className="p-2 rounded-2 bg-light border-start border-danger border-3 small d-flex align-items-center gap-2">
                        <i className={`bi ${item.icon} text-danger opacity-75`}></i>
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon="bi-cloud-arrow-up" title="5. Intellectual Property">
                <p>
                  Most study materials on {APP_NAME} are shared for educational use under fair-use principles. 
                  Original GyanStack assets (code, logo, layout) are our exclusive property.
                </p>
                <div className="alert alert-warning border-0 rounded-3 small">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>DMCA Notice:</strong> If you are a copyright holder and find your work here without 
                  authorization, please email <a href={`mailto:${CONTACT_EMAIL}`} className="alert-link">{CONTACT_EMAIL}</a> for immediate removal.
                </div>
              </Section>

              <Section icon="bi-universal-access" title="6. Disclaimer of Warranties">
                <p className="mb-0">
                  The platform is provided "As Is". While we strive for 100% accuracy, {APP_NAME} 
                  does not warrant that study materials are error-free. Users are advised to cross-verify 
                  information with official university curriculum.
                </p>
              </Section>

              <Section icon="bi-hammer" title="7. Governing Law">
                <p className="mb-0">
                  These terms are governed by the laws of <strong>India</strong>. Any legal proceedings 
                  arising from your use of {APP_NAME} will be handled exclusively in the courts of 
                  Gujarat, India.
                </p>
              </Section>

              <Section icon="bi-chat-heart" title="8. Questions?">
                <p className="mb-4">
                  If you have any questions regarding these terms, our support team is happy to help you.
                </p>
                <div className="d-grid">
                  <Link to="/contact" className="btn btn-secondary rounded-pill py-2 fw-bold shadow-sm">
                    Open Support Inquiry
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
                <Link to="/privacy" className="btn btn-nav-light btn-sm rounded-pill px-3 py-2">
                  <i className="bi bi-shield-lock me-1"></i>Privacy Policy
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
        .italic { font-style: italic; }
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
