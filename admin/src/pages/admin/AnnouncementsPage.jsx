import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen'; 
import { useAuth } from '../../context/AuthContext'; 

const AnnouncementItem = ({ ann }) => {
  return (
    <div className="card mb-4 border-0 rounded-4 shadow-sm glass-panel transition-hover overflow-hidden bg-white">
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="p-3 bg-primary bg-opacity-10 rounded-pill me-3">
             <i className="bi bi-megaphone-fill text-primary fs-4"></i>
          </div>
          <div className="flex-grow-1">
             <h5 className="h5 fw-bold text-dark mb-1">{ann.title}</h5>
             <div className="d-flex align-items-center gap-3">
                <small className="text-muted">
                   <i className="bi bi-calendar3 me-1"></i>
                   {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </small>
                <span className="vr opacity-10"></span>
                <small className="text-muted">
                   <i className="bi bi-person-circle me-1"></i>
                   {ann.requestedBy?.username || 'System Admin'}
                </small>
             </div>
          </div>
        </div>
        
        <div className="ps-0 ps-md-2 mt-3">
           <p className="card-text text-secondary mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
             {ann.content}
           </p>
        </div>
      </div>
      <div className="card-footer bg-light bg-opacity-50 border-0 py-2 px-4 d-flex justify-content-end">
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small fw-bold">
             <i className="bi bi-check-circle-fill me-1"></i> Approved Update
          </span>
      </div>
    </div>
  );
};


export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements?status=approved'); 
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error("Error fetching all announcements:", err);
      setError('Failed to load announcements.');
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchAllAnnouncements();
  }, []);

  if (loading) return <LoadingScreen text="Fetching all announcements..." />;
  
  return (
    <div className="container-fluid fade-in px-0 overflow-x-hidden">
        <div className="mb-4">
           <button 
             onClick={() => window.history.back()} 
             className="btn btn-light btn-sm rounded-pill px-3 shadow-sm text-primary fw-bold"
           >
             <i className="bi bi-arrow-left me-2"></i> Back
           </button>
        </div>

        <h4 className="fw-bold mb-4 text-primary">
            System Announcements
        </h4>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {announcements.length === 0 ? (
            <div className="alert alert-info border-0">No public announcements available yet.</div>
        ) : (
            <div className="row">
            <div className="col-12">
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
