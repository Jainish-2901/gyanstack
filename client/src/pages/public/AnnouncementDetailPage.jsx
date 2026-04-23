import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      setError('');
      try {
        const { data } = await api.get(`/announcements?status=approved`);
        const found = data.announcements.find(a => a._id === id);

        if (found) {
          setAnnouncement(found);
          api.post(`/announcements/${id}/track-open`).catch(() => { });
        } else {
          setError('Announcement details not found or expired.');
        }
      } catch (err) {
        console.error("Error fetching announcement detail:", err);
        setError('Failed to load announcement details.');
      }
      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  if (loading) return <LoadingScreen text="Fetching update details..." />;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="container my-4 my-md-5 pt-3">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="row justify-content-center"
      >
        <div className="col-lg-8 col-md-10">
          {/* Back Navigation */}
          <div className="mb-3 mb-md-4 text-start">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-light btn-sm rounded-pill px-3 shadow-sm text-primary fw-bold border"
            >
              <i className="bi bi-arrow-left me-2"></i> Back
            </button>
          </div>

          {error ? (
            <div className="glass-panel p-5 text-center rounded-4 border-0 shadow-sm bg-white">
              <i className="bi bi-exclamation-octagon text-danger display-4 mb-3 d-block"></i>
              <h4 className="fw-bold">{error}</h4>
              <Link to="/announcements" className="btn btn-primary mt-3 rounded-pill px-4">
                View All Announcements
              </Link>
            </div>
          ) : announcement && (
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white">
              {/* Header Section */}
              <div className="p-4 p-md-5 bg-primary bg-opacity-10 border-bottom border-primary border-opacity-10 text-start">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-megaphone-fill text-white fs-4"></i>
                  </div>
                  <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold extra-small">System Update</span>
                </div>

                <h2 className="fw-bold text-dark mb-3 responsive-title" style={{ lineHeight: '1.3' }}>
                  {announcement.title}
                </h2>

                <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar3 me-2"></i>
                    {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    {announcement.requestedBy?.username || 'Admin'}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 p-md-5 text-start">
                <div
                  className="announcement-body text-secondary"
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.7',
                    fontSize: '1.05rem',
                    wordBreak: 'break-word', // Fixes text overflow on mobile
                    overflowWrap: 'break-word'
                  }}
                >
                  {announcement.content}
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-3 p-md-4 bg-light bg-opacity-50 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <Link to="/announcements" className="text-decoration-none small fw-bold text-primary">
                  <i className="bi bi-collection-fill me-2"></i> All Updates
                </Link>
                <div className="text-muted extra-small text-center">
                  © GyanStack Official Portal
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .responsive-title {
          font-size: calc(1.3rem + 1vw);
        }
        .announcement-body {
          letter-spacing: -0.01em;
          color: #4a4a4a !important;
        }
        .extra-small {
          font-size: 0.75rem;
        }
        @media (max-width: 576px) {
          .p-4 {
            padding: 1.5rem !important;
          }
          .responsive-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}