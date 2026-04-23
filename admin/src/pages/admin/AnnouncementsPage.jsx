import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AnnouncementItem = ({ ann }) => {
  const navigate = useNavigate();

  // Status-based color mapping for Admin
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: 'bg-success', text: 'text-success', icon: 'bi-check-circle-fill' };
      case 'rejected': return { bg: 'bg-danger', text: 'text-danger', icon: 'bi-x-circle-fill' };
      default: return { bg: 'bg-warning', text: 'text-warning', icon: 'bi-clock-history' };
    }
  };

  const style = getStatusStyle(ann.status);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-4 border-0 rounded-4 shadow-sm glass-panel transition-hover overflow-hidden bg-white cursor-pointer"
      onClick={() => navigate(`/dashboard/announcements/${ann._id}`)} // Admin detail route
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body p-4 text-start">
        <div className="d-flex align-items-center mb-3">
          <div className="p-3 bg-primary bg-opacity-10 rounded-pill me-3">
            <i className="bi bi-megaphone-fill text-primary fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="h5 fw-bold text-dark mb-1">{ann.title}</h5>
              {/* Admin specific status badge */}
              <span className={`badge ${style.bg} bg-opacity-10 ${style.text} rounded-pill px-3 py-1 extra-small border border-${style.bg} border-opacity-10`}>
                {ann.status.toUpperCase()}
              </span>
            </div>
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
          <p className="card-text text-secondary mb-0 text-truncate-custom">
            {ann.content}
          </p>
        </div>
      </div>

      <div className="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 d-flex justify-content-between align-items-center">
        <span className="text-primary small fw-bold">
          View Detail & Stats <i className="bi bi-arrow-right ms-1"></i>
        </span>
        <span className="text-muted extra-small fw-medium">
          Sent to: {ann.sentCount || 0} Students
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
        .extra-small { font-size: 0.7rem; }
        .transition-hover:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCreateNewClick = () => {
    if (user?.role === 'superadmin') {
      navigate('/dashboard/announcements-manage');
    } else {
      navigate('/dashboard/my-announcements');
    }
  };

  const fetchAllAnnouncements = async () => {
    setLoading(true);
    try {
      // Admin API endpoint to get ALL requests
      const { data } = await api.get('/announcements/all');
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError('Failed to load global announcement registry.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllAnnouncements();
  }, []);

  if (loading) return <LoadingScreen text="Syncing Announcement Registry..." />;

  return (
    <div className="container-fluid px-3 py-4 pb-5">
      {/* Back Button */}
      <div className="mb-4 text-start">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light btn-sm rounded-pill px-4 shadow-sm text-primary fw-bold border bg-white"
        >
          <i className="bi bi-arrow-left me-2"></i> Dashboard
        </button>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary p-2 rounded-3 shadow-sm">
            <i className="bi bi-broadcast text-white fs-4"></i>
          </div>
          <div className="text-start">
            <h3 className="fw-bold m-0 text-dark">Announcement History</h3>
            <p className="text-muted small mb-0">Monitor and manage all system-wide broadcasts</p>
          </div>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-none d-md-block"
          onClick={handleCreateNewClick}
        >
          <i className="bi bi-plus-lg me-2"></i> Create New
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="glass-panel p-5 text-center rounded-4 border-0 shadow-sm bg-white">
          <i className="bi bi-inbox text-muted display-4 mb-3 d-block"></i>
          <h5 className="text-muted fw-bold">Registry is empty.</h5>
          <p className="text-muted small">No announcements have been recorded in the system yet.</p>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
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