import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen'; 
import { useAuth } from '../../context/AuthContext'; 
// -------------------

// Announcement Item Card Component
const AnnouncementItem = ({ ann }) => {
  return (
    <div className="card mb-3 border-0 bg-white">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title fw-bold text-dark">
              <i className="bi bi-megaphone-fill me-2 text-danger"></i>
              {ann.title}
            </h5>
            <p className="card-text small text-dark mb-2" style={{ whiteSpace: 'pre-wrap' }}>
              {ann.content}
            </p>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
          <small className="text-muted fst-italic">
            Posted: {new Date(ann.createdAt).toLocaleDateString()}
          </small>
          <small className="text-muted">
            By: {ann.requestedBy?.username || 'System'}
          </small>
        </div>
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
