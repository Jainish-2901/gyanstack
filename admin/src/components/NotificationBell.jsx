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
        const lastSeenId = localStorage.getItem('lastSeenAnnId_Admin');

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
      localStorage.setItem('lastSeenAnnId_Admin', latestId);
      const updatedAnn = announcements.map(ann => ({ ...ann, isRead: true }));
      setUnreadCount(0);
      setAnnouncements(updatedAnn);
    }
  };

  if (!user) return null;

  return (
    <div className="nav-item dropdown notification-dropdown list-unstyled position-relative">
      <button className="btn btn-link p-1 text-primary border-0" onClick={toggleDropdown}>
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: '5px', right: '-5px', fontSize: '10px' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay for Centered Notification (<= 490px) */}
          <div 
            className="notification-overlay d-md-none" 
            onClick={() => setIsOpen(false)}
          ></div>

          <ul className="dropdown-menu dropdown-menu-end shadow-lg show position-absolute glass-panel border-0" style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto', right: 0, top: '120%', zIndex: 2000 }}>
            <li className='dropdown-header fw-bold border-bottom d-flex justify-content-between align-items-center bg-transparent py-3'>
              <span className="text-primary">Announcements ({unreadCount} New)</span>
              <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setIsOpen(false)}></button>
            </li>

            {loading && <li className='dropdown-item text-center my-3 bg-transparent'><span className="spinner-border spinner-border-sm me-2 text-primary"></span><span className="text-muted">Loading...</span></li>}
            {announcements.length === 0 && !loading && <li className='dropdown-item text-muted small my-3 text-center bg-transparent'>No recent announcements.</li>}

            {announcements.map((ann, index) => (
              <li key={index}>
                <Link onClick={() => setIsOpen(false)} to="/announcements" className="dropdown-item py-2 border-bottom" style={{ cursor: 'pointer', whiteSpace: 'normal' }}>
                  <span className={`d-block small ${!ann.isRead ? 'fw-bold text-primary' : 'text-muted'}`}>{ann.title}</span>
                  <small className='d-block fst-italic text-secondary mt-1' style={{ fontSize: '0.75rem' }}>
                    {ann.isRead ? 'Read' : 'New Update'} - {new Date(ann.createdAt).toLocaleDateString()}
                  </small>
                </Link>
              </li>
            ))}
            <li><Link onClick={() => setIsOpen(false)} className="dropdown-item text-center small text-primary fw-bold py-3 bg-transparent" to="/announcements">View All Notifications</Link></li>
          </ul>
        </>
      )}
    </div>
  );
}
