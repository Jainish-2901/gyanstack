import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
    setIsProfileOpen(false);
    setIsLegalOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsNavOpen(false);
    setIsProfileOpen(false);
    logout();
  };

  const activeClass = ({ isActive }) => (isActive ? 'nav-link active text-nowrap' : 'nav-link text-nowrap');

  return (
    <nav className="navbar navbar-expand-lg border-0 fancy-header sticky-top p-0 shadow-sm">
      {/* Mobile Backdrop Overlay */}
      {isNavOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1999 }}
          onClick={() => setIsNavOpen(false)}></div>
      )}

      <div className="container-fluid px-3 px-lg-4">
        {/* --- BRAND & MOBILE ICONS --- */}
        <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto py-2">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setIsNavOpen(false)}>
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '32px', width: 'auto' }} />
            <span className="fw-bold">GyanStack</span>
          </Link>

          <div className="d-flex align-items-center d-lg-none gap-2">
            <ThemeToggle />
            <NotificationBell user={user} />
            <button className="navbar-toggler border-0 shadow-none p-0 ms-1" type="button" onClick={() => setIsNavOpen(!isNavOpen)}>
              <i className={`bi fs-1 text-primary ${isNavOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>

        {/* --- NAVIGATION COLLAPSE --- */}
        <div className={`navbar-collapse ${isNavOpen ? 'show mobile-sidebar' : 'collapse'}`} id="navbarNav">

          {/* --- NEW ALIGNED MOBILE HEADER --- */}
          <div className="d-lg-none d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-opacity-10">
            <div className="d-flex align-items-center">
              <i className="bi bi-compass text-primary me-2 fs-5"></i>
              <h5 className="mb-0 fw-bold text-primary">Navigation</h5>
            </div>

            <button
              className="btn btn-link text-muted p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
              onClick={() => setIsNavOpen(false)}
              style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-x-lg fs-4"></i>
            </button>
          </div>

          {/* 1. MOBILE PROFILE CARD (If logged in) */}
          {user && (
            <div className="d-lg-none mb-4 p-3 glass-panel rounded-4 border-0 shadow-sm">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle border border-primary border-2 me-3 overflow-hidden bg-primary d-flex align-items-center justify-content-center shadow-sm" style={{ width: '48px', height: '48px' }}>
                  {user.profileImage ? <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" /> : <span className="text-white fw-bold">{user.username.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="overflow-hidden">
                  <h6 className="mb-0 fw-bold text-dark text-truncate">{user.username}</h6>
                  <small className="text-muted text-uppercase x-small">{user.role}</small>
                </div>
              </div>
              <Link to="/dashboard" className="btn btn-primary btn-sm w-100 rounded-pill fw-bold" onClick={() => setIsNavOpen(false)}>Dashboard</Link>
            </div>
          )}

          {/* 2. MAIN NAV LINKS */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            <li className="nav-item"><NavLink className={activeClass} to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className={activeClass} to="/browse">Browse</NavLink></li>
            <li className="nav-item"><NavLink className={activeClass} to="/request">Request</NavLink></li>
            <li className="nav-item"><NavLink className={activeClass} to="/contact">Contact</NavLink></li>
            <li className="nav-item"><NavLink className={activeClass} to="/about">About</NavLink></li>

            {/* DESKTOP LEGAL DROPDOWN */}
            <li className="nav-item dropdown d-none d-lg-block"
              onMouseEnter={() => setIsLegalOpen(true)}
              onMouseLeave={() => setIsLegalOpen(false)}>
              <button className={`nav-link border-0 bg-transparent d-flex align-items-center gap-1 ${isLegalOpen ? 'text-primary' : ''}`}
                onClick={() => setIsLegalOpen(!isLegalOpen)}>
                Legal <i className={`bi bi-chevron-down x-small transition-all ${isLegalOpen ? 'rotate-180 text-primary' : 'opacity-50'}`}></i>
              </button>
              <div className={`dropdown-menu shadow-lg border-0 glass-panel custom-dropdown ${isLegalOpen ? 'show' : ''}`} style={{ minWidth: '200px' }}>
                <div className="p-2">
                  <Link className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2" to="/privacy">
                    <i className="bi bi-shield-check text-primary"></i> Privacy Policy
                  </Link>
                  <Link className="dropdown-item rounded-3 py-2 d-flex align-items-center gap-2" to="/terms">
                    <i className="bi bi-file-earmark-text text-primary"></i> Terms of Service
                  </Link>
                </div>
              </div>
            </li>

            {/* MOBILE LEGAL SECTION */}
            <li className="nav-item d-lg-none mt-3 border-top pt-3">
              <small className="text-muted text-uppercase fw-bold x-small px-3 d-block mb-2">Platform</small>
              <Link to="/privacy" className="nav-link text-muted py-2 px-3" onClick={() => setIsNavOpen(false)}><i className="bi bi-shield-lock me-2"></i>Privacy</Link>
              <Link to="/terms" className="nav-link text-muted py-2 px-3" onClick={() => setIsNavOpen(false)}><i className="bi bi-file-earmark-text me-2"></i>Terms</Link>
            </li>
          </ul>

          {/* --- DESKTOP ACTIONS --- */}
          <div className="d-none d-lg-flex align-items-center gap-3 ms-auto py-2">
            <ThemeToggle />
            <NotificationBell user={user} />

            {!user ? (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-bold text-nowrap" to="/login">Login</Link>
                <Link className="btn btn-primary rounded-pill px-4 btn-sm fw-bold shadow-sm text-nowrap" to="/signup">Sign Up</Link>
              </div>
            ) : (
              <div className="nav-item dropdown position-relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}>
                <button className="btn btn-light text-primary py-1 px-2 d-flex align-items-center gap-2 border-0 rounded-pill shadow-sm bg-white"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <div className="rounded-circle overflow-hidden border border-primary border-2 d-flex align-items-center justify-content-center bg-primary" style={{ width: '38px', height: '38px' }}>
                    {user.profileImage ? <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" /> : <span className="text-white fw-bold x-small">{user.username.charAt(0).toUpperCase()}</span>}
                  </div>
                  <span className="fw-bold pe-1 small">{user.username}</span>
                  <i className={`bi bi-chevron-down x-small transition-all ${isProfileOpen ? 'rotate-180' : 'opacity-50'}`}></i>
                </button>

                <div className={`dropdown-menu dropdown-menu-end shadow-lg border-0 glass-panel custom-dropdown ${isProfileOpen ? 'show' : ''}`} style={{ right: 0, minWidth: '220px' }}>
                  <div className="p-2">
                    <Link className="dropdown-item rounded-3 py-2 mb-1 d-flex align-items-center gap-2" to="/dashboard"><i className="bi bi-grid-fill text-primary"></i>Dashboard</Link>
                    <Link className="dropdown-item rounded-3 py-2 mb-1 d-flex align-items-center gap-2" to="/settings"><i className="bi bi-gear-fill text-muted"></i>Settings</Link>
                    <hr className="dropdown-divider opacity-10 mx-2" />
                    <button className="dropdown-item rounded-3 py-2 text-danger fw-bold d-flex align-items-center gap-2" onClick={handleLogout}>
                      <i className='bi bi-box-arrow-right'></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- MOBILE LOGOUT OR LOGIN/SIGNUP BUTTONS --- */}
          <div className="d-lg-none mt-auto pt-3 border-top border-opacity-10">
            {user ? (
              <button
                className="btn btn-outline-danger w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout Account
              </button>
            ) : (
              <div className="d-flex flex-column gap-2 px-2">
                <Link to="/login" className="btn btn-outline-primary w-100 rounded-pill fw-bold py-2" onClick={() => setIsNavOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm py-2" onClick={() => setIsNavOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .fancy-header { 
          background: var(--glass-bg); 
          backdrop-filter: blur(12px); 
          border-bottom: 1px solid var(--glass-border) !important;
        }
        
        .custom-dropdown {
          display: block !important;
          visibility: hidden;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.25s ease;
          position: absolute;
        }
        .custom-dropdown.show {
          visibility: visible;
          opacity: 1;
          transform: translateY(5px);
        }
        
        .rotate-180 { transform: rotate(180deg); }
        .x-small { font-size: 0.7rem; }

        @media (max-width: 991px) {
          .mobile-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 290px;
            background: var(--surface-color);
            z-index: 2005;
            padding: 1.5rem 1.25rem;
            display: flex;
            flex-direction: column;
            box-shadow: -15px 0 40px rgba(0,0,0,0.15);
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 1px solid var(--glass-border);
          }
          .mobile-sidebar.show { transform: translateX(0); }
          .mobile-sidebar .nav-link {
            padding: 0.85rem 1rem !important;
            border-radius: 0.75rem;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
}