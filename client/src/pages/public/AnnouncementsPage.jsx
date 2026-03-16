import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api'; // FIX: Standard relative path
import LoadingScreen from '../../components/LoadingScreen'; // FIX: Standard relative path
import { useAuth } from '../../context/AuthContext'; // FIX: Standard relative path

// Announcement Item Card Component
const AnnouncementItem = ({ ann }) => {
  return (
    <div className="card mb-4 border-0 rounded-4 shadow-sm glass-panel transition-hover overflow-hidden bg-white">
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
             <i className="bi bi-check-circle-fill me-1"></i> Published Update
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
  
  const isAuth = !!user;

  // Function to simulate marking all announcements as read
  const markAllAsRead = async (announcementIds) => {
    if (!isAuth) return;
    
    // Note: Production environment में, आप यहां एक single API call करेंगे:
    // await api.put('/announcements/mark-all-read', { ids: announcementIds });
    console.log("Simulating: Marking all visible announcements as read for user.");
  };

  const fetchAllAnnouncements = async () => {
    setLoading(true);
    try {
      // FIX: URL को /announcements?status=approved किया गया है
      const { data } = await api.get('/announcements?status=approved'); 
      
      const announcementsList = data.announcements.map(ann => ({
        ...ann,
        isRead: true, // Frontend में default read status
        // RequestedBy data को यहां से हटा दिया गया है
      }));

      setAnnouncements(announcementsList);
      
      // Announcements fetch hone ke turant baad mark as read API ko call karein
      if (isAuth && announcementsList.length > 0) {
          const ids = announcementsList.map(ann => ann._id);
          markAllAsRead(ids); // Automatic Mark as Read
      }

    } catch (err) {
      console.error("Error fetching all announcements:", err);
      setError('Failed to load announcements.');
    }
    setLoading(false);
  };
  
  // Page load hone par fetch karein
  useEffect(() => {
    fetchAllAnnouncements();
  }, [user]); // user state change hone par refresh ho

  // handleMarkAsRead function ki ab zaroorat nahi hai.

  if (loading) return <LoadingScreen text="Fetching all announcements..." />;
  
  return (
    <div className="container my-5 fade-in">
      {/* Back Button */}
      <div className="mb-4 text-start">
        <button 
          onClick={() => window.history.back()} 
          className="btn btn-light btn-sm rounded-pill px-3 shadow-sm text-primary fw-bold transition-all hover-translate-x-left"
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </button>
      </div>

      <h3 className="fw-bold mb-4 text-primary text-start">
        All System Announcements
      </h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {announcements.length === 0 ? (
        <div className="alert alert-info">No public announcements available yet.</div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {announcements.map(ann => (
              <AnnouncementItem 
                key={ann._id} 
                ann={ann} 
                isAuth={isAuth}
              />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}
