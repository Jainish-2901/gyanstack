import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { messaging, firebaseConfig } from '../services/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from '../context/AuthContext';

// ─── Audio Engine ────────────────────────────────────────────────────────────
// We use AudioContext + decoded buffer instead of new Audio().
// AudioContext can resume/play after a single user interaction anywhere in the
// page, whereas HTMLAudioElement.play() requires the *exact* click that called it.
let audioCtx = null;
let soundBuffer = null;
let audioUnlocked = false;

const initAudio = async () => {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  try {
    const response = await fetch('/notification-ping.mp3');
    const arrayBuffer = await response.arrayBuffer();
    soundBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.warn('GyanStack: Could not load notification sound.', e);
  }
};

const unlockAudio = async () => {
  if (audioUnlocked) return;
  if (!audioCtx) await initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  audioUnlocked = true;
};

const playPing = async () => {
  try {
    if (!audioCtx || !soundBuffer) await initAudio();
    if (!audioCtx || !soundBuffer) return;
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const source = audioCtx.createBufferSource();
    source.buffer = soundBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (e) {
    console.warn('GyanStack: Notification sound blocked:', e.message);
  }
};

// Unlock audio on any user interaction — this is the key trick.
// Once unlocked, AudioContext can play sounds programmatically.
if (typeof window !== 'undefined') {
  const unlock = () => { unlockAudio(); };
  window.addEventListener('click',      unlock, { once: false, passive: true });
  window.addEventListener('touchstart', unlock, { once: false, passive: true });
  window.addEventListener('keydown',    unlock, { once: false, passive: true });
  // Pre-load the audio file immediately
  initAudio();
}
// ─────────────────────────────────────────────────────────────────────────────

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
      playPing();
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || payload.data?.title || 'GyanStack';
        const body  = payload.notification?.body  || payload.data?.body  || 'New update!';
        new Notification(`📢 ${title}`, { body, icon: '/logo.png' });
      }

      fetchAnnouncements();
    });

    const handleSWMessage = (event) => {
      if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
        playPing();
        fetchAnnouncements();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    return () => {
      unsubscribe();
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [user, fetchAnnouncements]);



  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (!isMobile && scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
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
          <div className="notification-modal-overlay" onClick={() => setIsOpen(false)}></div>
          <ul className="dropdown-menu notification-modal-content shadow-lg show glass-panel border-0 p-0 overflow-hidden">
            <li className='dropdown-header border-bottom d-flex justify-content-between align-items-center py-3 px-4'>
              <span className="text-dark fw-bold mb-0">GyanStack Notifications:</span>
              <button className="btn-close" style={{ fontSize: '0.65rem' }} onClick={() => setIsOpen(false)}></button>
            </li>

            <div className="notification-scroll-area no-scrollbar">
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
                            <i className="bi bi-megaphone"></i>
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
                View All <i className="bi bi-arrow-right ms-1"></i>
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
        
        /* Immersive Full-Screen Backdrop (Admin Logic) */
        .notification-modal-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100vw; 
          height: 100vh; 
          background: rgba(0, 0, 0, 0.45); 
          backdrop-filter: blur(8px); 
          -webkit-backdrop-filter: blur(8px);
          z-index: 2200; 
          animation: fadeIn 0.25s ease;
        }

        /* Robust Top-Aligned Centered Modal Strategy (Admin Logic Sync) */
        ul.notification-modal-content {
          position: fixed !important;
          top: 120px !important; /* Increased to ensure absolute header clearance */
          left: 50% !important;
          transform: translateX(-50%) !important;
          margin: 0 !important;
          width: 92% !important;
          max-width: 450px !important;
          height: auto !important;
          max-height: 80vh !important;
          z-index: 2300 !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 1.75rem !important;
          background-color: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid var(--glass-border) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          animation: modalSlideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideDown { 
          from { opacity: 0; top: 110px !important; transform: translateX(-50%) scale(0.95); } 
          to { opacity: 1; top: 120px !important; transform: translateX(-50%) scale(1); } 
        }

        .notification-scroll-area { 
          flex-grow: 1 !important;
          overflow-y: auto !important;
          padding-bottom: 0.5rem;
        }

        .dropdown-header {
          padding: 1.25rem !important;
          background: rgba(99, 102, 241, 0.04);
        }

        /* Dark Mode Integration (High-Fidelity) */
        .dark ul.notification-modal-content {
          background-color: rgba(28, 28, 28, 0.98) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
        }
        .dark .dropdown-header {
          background: rgba(255, 255, 255, 0.04) !important;
          border-bottom-color: rgba(255, 255, 255, 0.1) !important;
        }
        .dark .text-dark { color: #f8fafc !important; }
        .dark .text-secondary { color: #94a3b8 !important; }
        .dark .border-bottom { border-color: rgba(255, 255, 255, 0.08) !important; }
        .dark .bg-light { background-color: #1e1e1e !important; border-top-color: rgba(255, 255, 255, 0.1) !important; }
        .dark .icon-circle.bg-light { background-color: #2d2d2d !important; }
        .dark .btn-close { filter: invert(1) grayscale(1) brightness(2); }
      `}</style>
    </div>
  );
};

export default NotificationBell;