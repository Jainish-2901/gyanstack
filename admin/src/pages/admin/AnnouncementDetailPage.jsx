import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/announcements/all`);
        const found = data.announcements.find(a => a._id === id);
        if (found) setAnnouncement(found);
        else setError('Announcement not found.');
      } catch (err) {
        setError('Failed to load update details.');
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingScreen text="Fetching update details..." />;

  return (
    <div className="container-fluid px-2 py-3 bg-light min-vh-100">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="row justify-content-center mx-0"
      >
        {/* col-12 for full width on mobile, col-md-8 for tablet/desktop */}
        <div className="col-12 col-md-8 col-lg-7 px-0">
          <div className="main-card border-0 rounded-4 shadow-lg overflow-hidden bg-white mx-auto">

            {/* Top Header Section */}
            <div className="header-section p-4 text-start"
              style={{ background: 'linear-gradient(180deg, #e6f7f4 0%, #ffffff 100%)' }}>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="icon-box bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: '42px', height: '42px', background: '#10b981' }}>
                  <i className="bi bi-megaphone-fill text-white fs-5"></i>
                </div>
                <span className="badge rounded-pill px-3 py-1 fw-bold"
                  style={{ background: '#10b981', color: '#fff', fontSize: '0.65rem' }}>
                  System Update
                </span>
              </div>

              <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.4rem', lineHeight: '1.3' }}>
                🚀 {announcement?.title}
              </h3>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted x-small fw-medium">
                <span className="d-flex align-items-center gap-1">
                  <i className="bi bi-calendar-event"></i>
                  {new Date(announcement?.createdAt).toLocaleDateString()}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <i className="bi bi-person-circle"></i>
                  {announcement?.requestedBy?.username || 'Jainish Dabgar'}
                </span>
              </div>
            </div>

            {/* Body Content - CRITICAL FIX FOR OVERFLOW */}
            <div className="body-section p-4 bg-white text-start">
              <div className="announcement-content text-secondary"
                style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',     // Links wrap honge
                  overflowWrap: 'anywhere'     // Screen se bahar nahi jayenge
                }}>
                {announcement?.content}
              </div>

              {/* Action Button */}
              {announcement?.redirectLink && (
                <div className="mt-4">
                  <a href={announcement.redirectLink} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex d-md-inline-flex align-items-center justify-content-center gap-2 w-100 w-md-auto">
                    <i className="bi bi-link-45deg fs-5"></i> View Resource
                  </a>
                </div>
              )}
            </div>

            {/* Footer Section */}
            <div className="footer-section px-4 py-3 bg-light bg-opacity-50 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <Link to="/announcements" className="text-decoration-none fw-bold d-flex align-items-center gap-2"
                style={{ color: '#10b981', fontSize: '0.85rem' }}>
                <i className="bi bi-briefcase-fill"></i> View other updates
              </Link>
              <div className="text-muted xx-small fw-medium text-center">
                © GyanStack Official Announcement
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .rounded-4 { border-radius: 1.5rem !important; }
        .x-small { font-size: 0.75rem; }
        .xx-small { font-size: 0.65rem; }
        
        /* Responsive Link Styling inside Content */
        .announcement-content a {
            color: #10b981;
            word-break: break-all;
        }

        @media (max-width: 576px) {
            .main-card {
                margin-bottom: 2rem;
            }
            .header-section {
                padding: 1.5rem !important;
            }
            .body-section {
                padding: 1.5rem !important;
            }
        }
      `}</style>
    </div>
  );
}