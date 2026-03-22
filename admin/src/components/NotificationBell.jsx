import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { messaging, firebaseConfig } from '../services/firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Pre-load the sound to avoid delay (Place this file in your /public folder)
const pingSound = new Audio('/notification-ping.mp3');

export default function NotificationBell({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Helper to play sound with browser restriction handling
  const playPing = () => {
    pingSound.play().catch(() => {
      console.log("Audio autoplay blocked. Interaction required first.");
    });
  };

  // --- 1. DATA FETCHING (Memoized) ---
  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/announcements?status=approved&limit=5');
      const lastSeenId = localStorage.getItem('lastSeenAnnId');

      const items = data.announcements.map((ann) => ({
        ...ann,
        isRead: lastSeenId ? (ann._id <= lastSeenId) : false,
      }));

      setAnnouncements(items);
      const unread = items.filter(i => !lastSeenId || i._id > lastSeenId).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
    setLoading(false);
  }, [user]);

  // --- 2. FIREBASE NOTIFICATION LOGIC ---
  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const params = new URLSearchParams(firebaseConfig).toString();
          const swUrl = `/firebase-messaging-sw.js?${params}`;

          const registration = await navigator.serviceWorker.register(swUrl);

          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });

          if (token) {
            await api.post('/auth/update-fcm-token', { fcmToken: token });
          }
        }
      } catch (err) {
        console.error("FCM Setup Error:", err);
      }
    };

    setupNotifications();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      // 1. Play Sound
      playPing();

      // 2. Show native browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo.png',
        });
      }

      // 3. Refresh list and count
      fetchAnnouncements();
    });

    return () => unsubscribe();
  }, [user, fetchAnnouncements]);

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, [user, fetchAnnouncements]);

  // Handle Mobile Scroll Lock
  useEffect(() => {
    if (isOpen && window.innerWidth <= 490) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);

    if (!isOpen && announcements.length > 0) {
      const latestId = announcements[0]._id;
      localStorage.setItem('lastSeenAnnId', latestId);
      setAnnouncements(prev => prev.map(ann => ({ ...ann, isRead: true })));
      setUnreadCount(0);
    }
  };

  if (!user) return null;

  return (
    <div className="nav-item dropdown notification-dropdown list-unstyled position-relative">
      <button className="btn btn-link p-1 text-primary border-0 shadow-none" onClick={toggleDropdown}>
        <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill shadow-pulse' : 'bi-bell'} fs-5`}></i>
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger"
            style={{ top: '8px', right: '-4px', fontSize: '9px', border: '2px solid white' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay d-md-none" onClick={() => setIsOpen(false)}></div>
          <ul className="dropdown-menu dropdown-menu-end shadow-lg show position-absolute glass-panel border-0 p-0 overflow-hidden"
            style={{
              minWidth: '320px',
              maxHeight: '480px',
              right: 0,
              top: '130%',
              zIndex: 2100,
              borderRadius: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.98)'
            }}>

            <li className='dropdown-header border-bottom d-flex justify-content-between align-items-center py-3 px-4 bg-white'>
              <span className="text-dark fw-bold mb-0">System Alerts</span>
              <button className="btn-close" style={{ fontSize: '0.7rem' }} onClick={() => setIsOpen(false)}></button>
            </li>

            <div className="notification-scroll-area no-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {loading ? (
                <div className='text-center my-5'><div className="spinner-border spinner-border-sm text-primary"></div></div>
              ) : announcements.length === 0 ? (
                <div className='text-center my-5 px-4 text-muted small'>
                  <i className="bi bi-mailbox fs-2 d-block mb-2 opacity-25"></i>
                  Everything caught up!
                </div>
              ) : (
                announcements.map((ann) => (
                  <li key={ann._id} className="border-bottom border-light">
                    <Link
                      to={`/announcements/${ann._id}`}
                      onClick={() => setIsOpen(false)}
                      className="text-decoration-none"
                    >
                      <div className="p-3 d-flex align-items-center gap-3 transition-all hover-bg-light"
                        style={{ background: !ann.isRead ? 'rgba(99, 102, 241, 0.04)' : 'transparent' }}>
                        <div className={`icon-circle-sm flex-shrink-0 ${!ann.isRead ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <i className="bi bi-megaphone"></i>
                        </div>
                        <div className="d-flex flex-column overflow-hidden text-start">
                          <span className={`small text-truncate ${!ann.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                            {ann.title}
                          </span>
                          <small className="text-muted extra-small">
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </small>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </div>

            <li className="bg-light border-top">
              <Link onClick={() => setIsOpen(false)} className="dropdown-item text-center small text-primary fw-bold py-3" to="/announcements">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </li>
          </ul>
        </>
      )}

      <style>{`
        .icon-circle-sm { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; }
        .hover-bg-light:hover { background: rgba(0,0,0,0.03) !important; }
        .shadow-pulse { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.6)); animation: bell-pulse 2s infinite; }
        @keyframes bell-pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}