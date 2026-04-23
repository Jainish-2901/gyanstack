import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AnnouncementItem = ({ ann }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-4 border-0 rounded-4 shadow-sm glass-panel transition-hover overflow-hidden bg-white cursor-pointer"
      onClick={() => navigate(`/announcements/${ann._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body p-4 text-start">
        <div className="d-flex align-items-center mb-3">
          <div className="p-3 bg-primary bg-opacity-10 rounded-pill me-3">
            <i className="bi bi-megaphone-fill text-primary fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <h5 className="h5 fw-bold text-dark mb-1">{ann.title}</h5>
            <div className="d-flex align-items-center gap-3">
              <small className="text-muted">
                <i className="bi bi-calendar3 me-1"></i>
                {new Date(ann.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </small>
              <span className="vr opacity-10 d-none d-md-block"></span>
              <small className="text-muted d-none d-md-block">
                <i className="bi bi-person-circle me-1"></i>
                {ann.requestedBy?.username || 'System Admin'}
              </small>
            </div>
          </div>
        </div>

        <div className="ps-0 ps-md-2 mt-3">
          {/* Humne yahan webkit-line-clamp use kiya hai taaki sirf 3 lines dikhe */}
          <p className="card-text text-secondary mb-0 text-truncate-custom">
            {ann.content}
          </p>
        </div>
      </div>

      <div className="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 d-flex justify-content-between align-items-center">
        <span className="text-primary small fw-bold">
          Read Full Details <i className="bi bi-arrow-right ms-1"></i>
        </span>
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small fw-bold">
          <i className="bi bi-check-circle-fill me-1"></i> Verified
        </span>
      </div>

      <style>{`
        .text-truncate-custom {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
          white-space: pre-wrap;
          line-height: 1.6;
        }
        .cursor-pointer:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </motion.div>
  );
};


export default function AnnouncementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAuth = !!user;

  const markAllAsRead = async (latestAnnouncementId) => {
    if (!isAuth || !latestAnnouncementId) return;

    try {
      await api.put('/announcements/mark-all-read', { latestId: latestAnnouncementId });
      // Update local state to reflect all are read
      setAnnouncements(prev => prev.map(ann => ({ ...ann, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const fetchAllAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements?status=approved');
      const announcementsList = data.announcements || [];

      setAnnouncements(announcementsList);

      // Agar user logged in hai aur announcements mile hain
      if (isAuth && announcementsList.length > 0) {
        markAllAsRead(announcementsList[0]._id);
      }

    } catch (err) {
      console.error("Error fetching all announcements:", err);
      setError('Failed to load announcements.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAnnouncements();
  }, [user]);

  if (loading) return <LoadingScreen text="Fetching all announcements..." />;

  return (
    <div className="container my-5 pt-3">
      {/* Back Button */}
      <div className="mb-4 text-start">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light btn-sm rounded-pill px-4 shadow-sm text-primary fw-bold border"
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </button>
      </div>

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary p-2 rounded-3 shadow-sm">
          <i className="bi bi- megaphone text-white fs-4"></i>
        </div>
        <h3 className="fw-bold m-0 text-dark">
          System Announcements
        </h3>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="glass-panel p-5 text-center rounded-4 border-0 shadow-sm bg-white">
          <i className="bi bi-inbox text-muted display-4 mb-3 d-block"></i>
          <h5 className="text-muted fw-bold">No announcements available at the moment.</h5>
          <p className="text-muted small">Stay tuned for future updates from GyanStack.</p>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {announcements.map(ann => (
              <AnnouncementItem
                key={ann._id}
                ann={ann}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}