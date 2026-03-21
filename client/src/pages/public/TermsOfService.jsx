import React from 'react';
import { Link } from 'react-router-dom';

const LAST_UPDATED = 'March 22, 2026';
const APP_NAME = 'GyanStack';
const APP_URL = 'https://gyanstack.vercel.app';
const CONTACT_EMAIL = 'jainishdabgar2901@gmail.com';

const Section = ({ icon, title, children }) => (
  <div className="mb-5">
    <h2 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>
      <span className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{ width: 38, height: 38, background: 'rgba(99,102,241,0.1)' }}>
        <i className={`bi ${icon} text-primary`} style={{ fontSize: '1rem' }}></i>
      </span>
      {title}
    </h2>
    <div className="text-muted" style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
      {children}
    </div>
  </div>
);

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 100%)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container py-3">
          <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
            <span>Terms of Service</span>
          </div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 52, height: 52, background: 'rgba(99,102,241,0.12)' }}>
              <i className="bi bi-file-earmark-text-fill text-primary fs-4"></i>
            </div>
            <div>
              <h1 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>Terms of Service</h1>
              <p className="text-muted mb-0 small">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ maxWidth: 620, fontSize: '0.95rem' }}>
            By using {APP_NAME}, you agree to these terms. Please read them carefully
            before accessing or using our platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-panel rounded-4 p-4 p-md-5 shadow-sm">

              <Section icon="bi-check-circle" title="1. Acceptance of Terms">
                <p className="mb-0">
                  By accessing or using <strong style={{ color: 'var(--text-primary)' }}>{APP_NAME}</strong>
                  &nbsp;(<a href={APP_URL} className="text-primary">{APP_URL}</a>), you agree to be bound
                  by these Terms of Service and our <Link to="/privacy" className="text-primary">Privacy Policy</Link>.
                  If you do not agree to any part of these terms, please do not use the platform.
                </p>
              </Section>

              <Section icon="bi-book" title="2. About GyanStack">
                <p className="mb-0">
                  {APP_NAME} is a free educational resource platform designed to help BCA, MCA, and
                  other computer science students access study materials including notes, past exam
                  papers, video lectures, and reference documents. The platform is provided free
                  of charge for educational purposes only.
                </p>
              </Section>

              <Section icon="bi-person-badge" title="3. User Accounts">
                <p>To access certain features, you must create an account. By creating an account:</p>
                <ul>
                  <li>You confirm you are at least <strong>13 years of age</strong></li>
                  <li>You agree to provide accurate and up-to-date information</li>
                  <li>You are responsible for keeping your account credentials secure</li>
                  <li>You are responsible for all activity that occurs under your account</li>
                  <li>You agree to notify us immediately of any unauthorized use at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary">{CONTACT_EMAIL}</a></li>
                </ul>
                <p className="mb-0">
                  We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </Section>

              <Section icon="bi-hand-thumbs-up" title="4. Acceptable Use">
                <p>You agree to use {APP_NAME} only for lawful, educational purposes. You must NOT:</p>
                <ul>
                  <li>Upload or distribute copyrighted content without permission</li>
                  <li>Use the platform to harass, threaten, or harm other users</li>
                  <li>Attempt to hack, scrape, or perform DDoS attacks on our servers</li>
                  <li>Create multiple accounts to circumvent restrictions or bans</li>
                  <li>Use the platform for commercial purposes or advertising without written consent</li>
                  <li>Upload malware, viruses, or any malicious code</li>
                  <li>Misrepresent yourself or impersonate other users or administrators</li>
                </ul>
                <p className="mb-0">
                  Violation of these rules may result in immediate account termination and
                  reporting to appropriate authorities.
                </p>
              </Section>

              <Section icon="bi-upload" title="5. Content Uploaded by Users">
                <p>If you are an administrator or contribute content to {APP_NAME}:</p>
                <ul>
                  <li>You confirm you have the right to share the content</li>
                  <li>You grant {APP_NAME} a non-exclusive, royalty-free license to display
                    and distribute the content on our platform</li>
                  <li>You are solely responsible for the accuracy and legality of the content</li>
                  <li>We reserve the right to remove any content that violates these terms
                    or applicable laws without prior notice</li>
                </ul>
                <p className="mb-0">
                  {APP_NAME} does not guarantee the accuracy, completeness, or reliability of
                  any user-contributed content.
                </p>
              </Section>

              <Section icon="bi-c-circle" title="6. Intellectual Property">
                <p>
                  All original content, branding, design, and code of {APP_NAME} is the
                  intellectual property of the {APP_NAME} team. You may not copy, reproduce,
                  or distribute our platform's code or design without explicit written permission.
                </p>
                <p className="mb-0">
                  Study materials, notes, and papers shared on the platform may be subject to
                  third-party copyrights. We share these resources in good faith for educational
                  use under fair-use principles. If you are a copyright holder and believe your
                  work has been posted without permission, please contact us at&nbsp;
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary">{CONTACT_EMAIL}</a>&nbsp;
                  and we will promptly remove it.
                </p>
              </Section>

              <Section icon="bi-google" title="7. Third-Party Services">
                <p>
                  {APP_NAME} uses third-party services to operate. Your use of these services
                  is also governed by their respective terms and privacy policies:
                </p>
                <ul>
                  <li><a href="https://policies.google.com" target="_blank" rel="noreferrer" className="text-primary">Google (Sign-In, Drive)</a></li>
                  <li><a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-primary">MongoDB Atlas (database)</a></li>
                  <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-primary">Vercel (hosting)</a></li>
                </ul>
                <p className="mb-0">
                  We are not responsible for the content or practices of these third-party services.
                </p>
              </Section>

              <Section icon="bi-exclamation-triangle" title="8. Disclaimer of Warranties">
                <p className="mb-0">
                  {APP_NAME} is provided <strong style={{ color: 'var(--text-primary)' }}>"as is"</strong> and
                  <strong style={{ color: 'var(--text-primary)' }}>"as available"</strong> without any warranties,
                  express or implied. We do not guarantee that the platform will be uninterrupted,
                  error-free, or completely secure. Study materials are shared for educational
                  reference — always verify information with official sources for exams.
                </p>
              </Section>

              <Section icon="bi-shield-x" title="9. Limitation of Liability">
                <p className="mb-0">
                  To the fullest extent permitted by applicable law, {APP_NAME} and its team
                  shall not be liable for any indirect, incidental, special, or consequential
                  damages arising from your use of the platform, including but not limited to
                  loss of data, exam results, or academic performance. Your sole remedy for
                  dissatisfaction is to stop using the service.
                </p>
              </Section>

              <Section icon="bi-arrow-repeat" title="10. Changes to Terms">
                <p className="mb-0">
                  We may modify these Terms of Service at any time. Changes will be reflected
                  by updating the "Last updated" date at the top of this page. Continued use
                  of {APP_NAME} after any changes constitutes your acceptance of the new terms.
                  For material changes, we will notify users via an in-app announcement.
                </p>
              </Section>

              <Section icon="bi-geo-alt" title="11. Governing Law">
                <p className="mb-0">
                  These Terms are governed by the laws of <strong style={{ color: 'var(--text-primary)' }}>India</strong>.
                  Any disputes arising from these Terms shall be subject to the exclusive
                  jurisdiction of the courts of Gujarat, India.
                </p>
              </Section>

              <Section icon="bi-envelope" title="12. Contact Us">
                <p className="mb-0">
                  For questions about these Terms of Service:
                  <br /><br />
                  📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary fw-semibold">{CONTACT_EMAIL}</a>
                  <br />
                  🌐 Website: <a href={APP_URL} className="text-primary">{APP_URL}</a>
                  <br /><br />
                  Or use our <Link to="/contact" className="text-primary">Contact Page</Link>.
                </p>
              </Section>

              {/* Bottom nav */}
              <div className="d-flex flex-wrap gap-3 pt-4 border-top" style={{ borderColor: 'var(--glass-border)' }}>
                <Link to="/privacy" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="bi bi-shield-lock me-1"></i>Privacy Policy
                </Link>
                <Link to="/" className="btn btn-light btn-sm rounded-pill px-3">
                  <i className="bi bi-house me-1"></i>Back to Home
                </Link>
                <Link to="/contact" className="btn btn-light btn-sm rounded-pill px-3">
                  <i className="bi bi-envelope me-1"></i>Contact Us
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
