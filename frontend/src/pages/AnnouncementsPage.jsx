import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // FIX: Standard relative path
import LoadingScreen from '../components/LoadingScreen'; // FIX: Standard relative path
import { useAuth } from '../context/AuthContext'; // FIX: Standard relative path

// Announcement Item Card Component
const AnnouncementItem = ({ ann, isAuth }) => {
  // अब isNew check की ज़रूरत नहीं है क्योंकि Mark as Read automatic हो गया है
  const isRead = true; 
  
  return (
    <div className={`card shadow-sm mb-3 border-0 bg-white`}>
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
          {/* Status badge yahaan se hata diya gaya hai */}
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
          <small className="text-muted fst-italic">
            Posted: {new Date(ann.createdAt).toLocaleDateString()}
          </small>
          {/* Requested By aur Mark as Read button yahaan se hata diye gaye hain */}
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
      <h1 className="display-4 fw-bold mb-4" style={{ color: '#0056b3' }}>
        All System Announcements
      </h1>
      
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