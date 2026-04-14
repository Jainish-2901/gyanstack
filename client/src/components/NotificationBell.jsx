import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { messaging, firebaseConfig } from '../services/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext';

const pingSound = new Audio('/notification-ping.mp3');

const NotificationBell = () => {
  const { user, setUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/announcements?status=approved&limit=5');

      const items = data.announcements.map((ann) => ({
        ...ann,
        isRead: user.lastSeenAnnId ? (ann._id <= user.lastSeenAnnId) : false,
      }));

      setAnnouncements(items);
      const unread = items.filter(i => !user.lastSeenAnnId || i._id > user.lastSeenAnnId).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setUnreadCount(0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}` +
            `&authDomain=${firebaseConfig.authDomain}` +
            `&projectId=${firebaseConfig.projectId}` +
            `&storageBucket=${firebaseConfig.storageBucket}` +
            `&messagingSenderId=${firebaseConfig.messagingSenderId}` +
            `&appId=${firebaseConfig.appId}`;

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

    setupFCM();

    const unsubscribe = onMessage(messaging, (payload) => {
      pingSound.play().catch(() => console.log("Sound blocked by browser until user click"));

      if (Notification.permission === 'granted') {
        new Notification(`GyanStack: ${payload.notification.title}`, {
          body: payload.notification.body,
          icon: '/logo.png',
        });
      }

      fetchAnnouncements();
    });

    return () => unsubscribe();
  }, [user, fetchAnnouncements]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 490;
    if (isOpen && isMobile) {
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

      api.put('/announcements/mark-all-read', { latestId }).then(({ data }) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      }).catch(err => {
        console.error("Failed to sync read status:", err);
      });

      setAnnouncements(prev => prev.map(ann => ({ ...ann, isRead: true })));
      setUnreadCount(0);
    }
  };

  if (!user) return null;

  return (
    <div className="nav-item dropdown notification-dropdown list-unstyled position-relative">
      <a className="nav-link p-2" href="#" onClick={toggleDropdown}>
        <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill shadow-pulse' : 'bi-bell'} fs-5 text-primary`}></i>
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger shadow-sm"
            style={{ top: '8px', right: '0px', border: '2px solid var(--surface-color)', fontSize: '10px' }}>
            {unreadCount}
          </span>
        )}
      </a>

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
              borderRadius: '1.25rem',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)'
            }}>

            <li className='dropdown-header border-bottom d-flex justify-content-between align-items-center py-3 px-4'>
              <span className="text-dark fw-bold h6 mb-0">Notifications</span>
              <button className="btn-close" style={{ fontSize: '0.65rem' }} onClick={() => setIsOpen(false)}></button>
            </li>

            <div className="notification-scroll-area no-scrollbar" style={{ overflowY: 'auto', maxHeight: '350px' }}>
              {loading ? (
                <li className='text-center my-5'><div className="spinner-border spinner-border-sm text-primary"></div></li>
              ) : announcements.length === 0 ? (
                <li className='text-center my-5 px-4 text-muted small'>No new updates right now.</li>
              ) : (
                announcements.map((ann) => (
                  <li key={ann._id} className="border-bottom border-light transition-all">
                    <Link onClick={() => setIsOpen(false)} to={`/announcements/${ann._id}`} className="text-decoration-none">
                      <div className="p-3 d-flex align-items-center justify-content-between gap-3"
                        style={{ background: !ann.isRead ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <div className={`icon-circle ${!ann.isRead ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                            <i className="bi bi-megaphone-fill"></i>
                          </div>
                          <div className="d-flex flex-column overflow-hidden text-start">
                            <span className={`small text-truncate ${!ann.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                              {ann.title}
                            </span>
                            <small className="text-muted extra-small">
                              {new Date(ann.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </small>
                          </div>
                        </div>
                        <span className="btn btn-sm btn-light border-0 rounded-pill px-3 fw-bold text-primary extra-small shadow-sm">View</span>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </div>

            <li className="bg-light border-top">
              <Link onClick={() => setIsOpen(false)} className="dropdown-item text-center small text-primary fw-bold py-3" to="/announcements">
                View All Announcements <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </li>
          </ul>
        </>
      )}

      <style>{`
        .shadow-pulse { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.6)); animation: pulse-ring 2s infinite; }
        @keyframes pulse-ring { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .extra-small { font-size: 0.65rem; }
        .icon-circle { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
        .notification-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: 2000; }
      `}</style>
    </div>
  );
};

export default NotificationBell;