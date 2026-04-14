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
        const { data } = await api.get(`/announcements?status=approved`);
        const found = data.announcements.find(a => a._id === id);

        if (found) {
          setAnnouncement(found);
        } else {
          setError('Update not found.');
        }
      } catch (err) {
        console.error("Error fetching announcement detail:", err);
        setError('Failed to load update details.');
      }
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  if (loading) return <LoadingScreen text="Fetching update details..." />;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="container-fluid p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="row justify-content-center"
      >
        <div className="col-xl-9 col-lg-10">
          {/* Back Navigation */}
          <div className="mb-4 text-start">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-white btn-sm rounded-pill px-3 shadow-sm text-primary fw-bold d-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i> Back to Dashboard
            </button>
          </div>

          {error ? (
            <div className="glass-panel p-5 text-center rounded-4 border-0 shadow-sm bg-white">
              <i className="bi bi-exclamation-triangle text-warning display-4 mb-3 d-block"></i>
              <h4 className="fw-bold text-dark">{error}</h4>
              <Link to="/announcements" className="btn btn-primary mt-3 rounded-pill px-4">
                View All Updates
              </Link>
            </div>
          ) : announcement && (
            <div className="glass-panel border-0 rounded-4 shadow-lg overflow-hidden bg-white">
              {/* Header Section */}
              <div className="p-4 p-md-5 bg-primary bg-opacity-10 border-bottom border-primary border-opacity-10 text-start">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-megaphone-fill text-white fs-3"></i>
                  </div>
                  <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold small">System Update Detail</span>
                </div>
                <h2 className="display-6 fw-bold text-dark mb-2">{announcement.title}</h2>
                <div className="d-flex align-items-center gap-4 text-muted small">
                  <span>
                    <i className="bi bi-calendar3 me-2"></i>
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span>
                    <i className="bi bi-person-badge me-2"></i>
                    Admin View
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 p-md-5 text-start bg-white">
                <div
                  className="announcement-body text-secondary"
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                  }}
                >
                  {announcement.content}
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-4 bg-light bg-opacity-50 border-top d-flex justify-content-between align-items-center">
                <Link to="/announcements" className="text-decoration-none small fw-bold text-primary">
                  <i className="bi bi-collection-fill me-2"></i> Announcement Management
                </Link>
                <div className="text-muted extra-small">
                  GyanStack Admin Registry
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .extra-small { font-size: 0.75rem; }
        .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
        
        /* Dark Mode Integration */
        .dark .glass-panel { background: rgba(30, 30, 30, 0.95); border-color: rgba(255,255,255,0.08) !important; }
        .dark .text-dark { color: #f8fafc !important; }
        .dark .text-secondary { color: #94a3b8 !important; }
        .dark .bg-white { background-color: #1e1e1e !important; }
        .dark .btn-white { background-color: #1e1e1e !important; color: #3b82f6 !important; border-color: #333 !important; }
      `}</style>
    </div>
  );
}
