import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Lock scroll on mobile when notification is centered
    const isMobile = window.innerWidth <= 490;
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!user) return;
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/announcements?status=approved&limit=5'); 
        const lastSeenId = localStorage.getItem('lastSeenAnnId'); // Using shared key
        
        const items = data.announcements.map((ann) => ({
          ...ann,
          isRead: lastSeenId ? (ann._id <= lastSeenId) : false, 
        }));
        
        setAnnouncements(items);
        const unread = items.filter(i => !lastSeenId || i._id > lastSeenId).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        setUnreadCount(0);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, [user]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    
    if (!isOpen && announcements.length > 0) {
      const latestId = announcements[0]._id;
      localStorage.setItem('lastSeenAnnId', latestId);
      
      const updatedAnn = announcements.map(ann => ({ ...ann, isRead: true }));
      setUnreadCount(0);
      setAnnouncements(updatedAnn);
    }
  };

  if (!user) return null;

  return (
    <div className="nav-item dropdown notification-dropdown list-unstyled position-relative">
      <button 
        className="btn btn-link p-1 text-primary border-0" 
        onClick={toggleDropdown}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: '5px', right: '-5px', fontSize: '10px' }}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="notification-overlay d-md-none" 
            onClick={() => setIsOpen(false)}
          ></div>

          <ul className="dropdown-menu dropdown-menu-end shadow-lg show position-absolute glass-panel border-0 p-0 overflow-hidden" style={{ minWidth: '350px', maxHeight: '480px', overflowY: 'auto', right: 0, top: '120%', zIndex: 2100, borderRadius: '1.25rem' }}>
            <li className='dropdown-header border-bottom d-flex justify-content-between align-items-center py-3 px-4 bg-white bg-opacity-50'>
              <span className="text-dark fw-bold h6 mb-0">Notifications</span>
              <div className="d-flex align-items-center gap-2">
                 {unreadCount > 0 && <span className="badge bg-primary rounded-pill extra-small" style={{fontSize: '10px'}}>{unreadCount} New</span>}
                 <button className="btn-close ms-2" style={{fontSize: '0.6rem'}} onClick={() => setIsOpen(false)}></button>
              </div>
            </li>
            
            <div className="notification-scroll-area">
              {loading && <li className='text-center my-5'><span className="spinner-border spinner-border-sm me-2 text-primary"></span><span className="text-muted small">Loading...</span></li>}
              {announcements.length === 0 && !loading && <li className='text-center my-5 px-4 text-muted small'>No recent announcements.</li>}

              {announcements.map((ann, index) => (
                <li key={index} className="border-bottom border-light border-opacity-50">
                  <div 
                    className="p-3 d-flex align-items-center justify-content-between gap-3"
                    style={{ background: !ann.isRead ? 'rgba(13, 110, 253, 0.03)' : 'transparent' }}
                  >
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-circle flex-shrink-0 ${!ann.isRead ? 'bg-primary bg-opacity-10' : 'bg-light'}`}>
                         <i className={`bi ${!ann.isRead ? 'bi-megaphone-fill text-primary' : 'bi-megaphone text-secondary'} fs-6`}></i>
                      </div>
                      <div className="d-flex flex-column overflow-hidden text-start">
                        <span className={`small text-truncate ${!ann.isRead ? 'fw-bold text-dark' : 'text-secondary fw-medium'}`}>
                          {ann.title}
                        </span>
                        <small className="text-secondary opacity-75" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </small>
                      </div>
                    </div>
                    <Link 
                      onClick={() => setIsOpen(false)} 
                      to="/announcements" 
                      className="btn btn-sm btn-light border rounded-pill px-3 fw-bold text-primary flex-shrink-0"
                      style={{ fontSize: '0.7rem' }}
                    >
                      View <i className="bi bi-chevron-right ms-1"></i>
                    </Link>
                  </div>
                </li>
              ))}
            </div>

            <li className="bg-light bg-opacity-50 border-top mt-auto">
              <Link onClick={() => setIsOpen(false)} className="dropdown-item text-center small text-primary fw-bold py-3 hover-bg-light" to="/announcements">
                View All Notifications <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
