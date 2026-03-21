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

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div className="py-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 100%)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container py-3">
          <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
            <Link to="/" className="text-decoration-none text-muted">Home</Link>
            <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
            <span>Privacy Policy</span>
          </div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 52, height: 52, background: 'rgba(99,102,241,0.12)' }}>
              <i className="bi bi-shield-lock-fill text-primary fs-4"></i>
            </div>
            <div>
              <h1 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>Privacy Policy</h1>
              <p className="text-muted mb-0 small">Last updated: {LAST_UPDATED}</p>
            </div>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ maxWidth: 620, fontSize: '0.95rem' }}>
            At {APP_NAME}, we value your privacy. This policy explains what data we collect,
            why we collect it, and how we protect it.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-panel rounded-4 p-4 p-md-5 shadow-sm">

              <Section icon="bi-info-circle" title="1. Who We Are">
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>{APP_NAME}</strong> is a free educational
                  resource platform for BCA, MCA, and other students. We provide
                  study notes, past papers, video lectures, and other academic materials.
                </p>
                <p className="mb-0">
                  Website: <a href={APP_URL} className="text-primary">{APP_URL}</a><br />
                  Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary">{CONTACT_EMAIL}</a>
                </p>
              </Section>

              <Section icon="bi-database" title="2. Information We Collect">
                <p><strong style={{ color: 'var(--text-primary)' }}>a) Account Information</strong></p>
                <p>When you register or sign in with Google, we collect:</p>
                <ul>
                  <li>Your name and email address (from Google OAuth)</li>
                  <li>Your profile picture URL (from Google)</li>
                  <li>Account creation date and last login time</li>
                </ul>
                <p><strong style={{ color: 'var(--text-primary)' }}>b) Usage Data</strong></p>
                <p>We automatically collect:</p>
                <ul>
                  <li>Content items you view, like, save, or download</li>
                  <li>Search queries within the platform</li>
                  <li>Device type and browser (via standard HTTP headers)</li>
                </ul>
                <p className="mb-0"><strong style={{ color: 'var(--text-primary)' }}>c) Content Requests &amp; Inquiries</strong></p>
                <p className="mb-0">If you submit a content request or contact form, we store the message
                  and your email to respond to you.</p>
              </Section>

              <Section icon="bi-google" title="3. Google Sign-In (OAuth 2.0)">
                <p>
                  We use <strong style={{ color: 'var(--text-primary)' }}>Google Sign-In</strong> to let
                  you log in without creating a separate password. When you authenticate via Google:
                </p>
                <ul>
                  <li>We request only your <strong>basic profile</strong> and <strong>email</strong> — no access to your Gmail, Drive files, or contacts</li>
                  <li>Your Google password is never shared with or stored by us</li>
                  <li>You can revoke our access anytime at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-primary">myaccount.google.com/permissions</a></li>
                </ul>
                <p className="mb-0">
                  Google's privacy policy applies to the sign-in process:&nbsp;
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-primary">
                    policies.google.com/privacy
                  </a>
                </p>
              </Section>

              <Section icon="bi-hdd" title="4. How We Use Your Data">
                <p>We use the collected information to:</p>
                <ul>
                  <li>Provide and improve the {APP_NAME} platform</li>
                  <li>Personalize your experience (saved content, liked items)</li>
                  <li>Display your profile and contributions</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Send important notifications (e.g. announcements) — you can opt out anytime</li>
                  <li>Monitor usage to prevent abuse and maintain platform security</li>
                </ul>
                <p className="mb-0">
                  We <strong>do not sell</strong> your personal data to any third party.
                  We <strong>do not use</strong> your data for advertising.
                </p>
              </Section>

              <Section icon="bi-share" title="5. Data Sharing">
                <p>We share data only in these limited circumstances:</p>
                <ul>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Service Providers:</strong> MongoDB Atlas (database), Vercel (hosting), Google Drive (file storage) — all bound by their own privacy policies</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Legal Requirements:</strong> If required by law or to protect rights and safety</li>
                </ul>
                <p className="mb-0">No data is shared for marketing or advertising purposes.</p>
              </Section>

              <Section icon="bi-cookie" title="6. Cookies &amp; Local Storage">
                <p>We use:</p>
                <ul>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Authentication cookies:</strong> To keep you signed in securely (HTTP-only, session-scoped)</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>localStorage:</strong> To remember your theme preference (dark/light) and viewed content for view-count tracking</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>No third-party tracking cookies</strong> — we do not use Google Analytics, Facebook Pixel, or similar trackers</li>
                </ul>
              </Section>

              <Section icon="bi-lock" title="7. Data Security">
                <p>We implement industry-standard security measures:</p>
                <ul>
                  <li>All data transmitted over HTTPS (TLS encryption)</li>
                  <li>Passwords are hashed using bcrypt (never stored in plain text)</li>
                  <li>Authentication via JWT tokens with expiry</li>
                  <li>Database access restricted by IP allowlist and credentials</li>
                </ul>
                <p className="mb-0">No method of transmission or storage is 100% secure. If you discover a security
                  vulnerability, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary">{CONTACT_EMAIL}</a>.</p>
              </Section>

              <Section icon="bi-person-check" title="8. Your Rights">
                <p>You have the right to:</p>
                <ul>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Access</strong> the personal data we hold about you</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Correct</strong> inaccurate data via your profile settings</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Delete</strong> your account and associated data by contacting us</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Withdraw consent</strong> for Google Sign-In by revoking app access</li>
                </ul>
                <p className="mb-0">To exercise any of these rights, email us at&nbsp;
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary">{CONTACT_EMAIL}</a>.
                  We will respond within 30 days.</p>
              </Section>

              <Section icon="bi-person-bounding-box" title="9. Children's Privacy">
                <p className="mb-0">
                  {APP_NAME} is intended for students aged 16 and above. We do not knowingly
                  collect personal information from children under 13. If you believe a child
                  under 13 has provided us with personal data, please contact us and we will
                  delete it promptly.
                </p>
              </Section>

              <Section icon="bi-arrow-repeat" title="10. Changes to This Policy">
                <p className="mb-0">
                  We may update this Privacy Policy from time to time. When we do, we will
                  update the "Last updated" date at the top of this page. Continued use of
                  {APP_NAME} after changes means you accept the updated policy. For significant
                  changes, we will notify you via an in-app announcement.
                </p>
              </Section>

              <Section icon="bi-envelope" title="11. Contact Us">
                <p className="mb-0">
                  If you have any questions about this Privacy Policy or how we handle your data:
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
                <Link to="/terms" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="bi bi-file-text me-1"></i>Terms of Service
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
