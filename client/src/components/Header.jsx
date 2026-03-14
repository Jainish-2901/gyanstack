import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle'; 
import NotificationBell from './NotificationBell';

// NotificationBell component removed from here


export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-close nav and dropdowns when route changes
  useEffect(() => {
    setIsNavOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Fix for background scroll when mobile nav is open
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isNavOpen]);

  const handleLogout = () => {
    setIsNavOpen(false);
    setIsProfileOpen(false);
    logout(); 
  };

  const closeNav = () => setIsNavOpen(false);

  const activeClass = ({ isActive }) => (isActive ? 'nav-link active text-nowrap' : 'nav-link text-nowrap');

  return (
    <nav className="navbar navbar-expand-lg border-0 fancy-header sticky-top">
      {/* Sidebar Overlay for Mobile (<= 490px) */}
      {isNavOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
          style={{ zIndex: 1999 }}
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}
      <div className="container-fluid">
        
        {/* --- 1. BRAND AND MOBILE ACTIONS --- */}
        <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto me-lg-4">
          
          <Link className="navbar-brand text-nowrap" to="/" onClick={closeNav}>
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '35px', width: 'auto' }} />GyanStack
          </Link>
          
          <div className="d-flex align-items-center d-lg-none gap-2">
            <ThemeToggle /> 
            <NotificationBell user={user} />
            <button 
                className="navbar-toggler border-0 shadow-none p-0 ms-1" 
                type="button" 
                onClick={() => setIsNavOpen(!isNavOpen)}
                aria-expanded={isNavOpen}
            >
              <i className={`bi fs-1 text-primary ${isNavOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
        
        <div className={`navbar-collapse ${isNavOpen ? 'show mt-3 border-top pt-3' : 'collapse'}`} id="navbarNav">
          {/* Close button for Sidebar (<= 490px) */}
          <div className="d-flex d-lg-none justify-content-between align-items-center mb-4 border-bottom pb-3">
             <div className="navbar-brand text-primary fw-bold">Menu</div>
             <button className="btn btn-link text-primary p-0" onClick={() => setIsNavOpen(false)}>
               <i className="bi bi-x-lg fs-4"></i>
             </button>
          </div>

          {!user ? null : (
            <div className="d-lg-none mb-4 p-3 glass-panel rounded-4 border-primary border-opacity-10 shadow-sm">
               <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle border border-primary border-2 me-3 overflow-hidden shadow-sm d-flex align-items-center justify-content-center bg-primary" style={{ width: '50px', height: '50px' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="text-white fs-4 fw-bold">{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="d-flex flex-column overflow-hidden">
                    <span className="fs-6 fw-bold text-primary text-truncate">{user.username}</span>
                    <small className="text-muted text-uppercase" style={{fontSize: '0.65rem'}}>{user.role}</small>
                  </div>
               </div>
               <Link to="/dashboard" className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm" onClick={() => setIsNavOpen(false)}>
                  <i className="bi bi-grid-fill me-2"></i>
                  Go to Dashboard
               </Link>
            </div>
          )}

          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1"> 
            <li className="nav-item">
              <NavLink className={activeClass} to="/" onClick={closeNav}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={activeClass} to="/browse" onClick={closeNav}>Browse</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={activeClass} to="/request" onClick={closeNav}>Request Form</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={activeClass} to="/contact" onClick={closeNav}>Contact</NavLink>
            </li>
            {user && (
              <li className="nav-item d-lg-none">
                <Link to="/settings" className="nav-link text-muted" onClick={closeNav}>
                  <i className="bi bi-gear-fill me-2"></i> Profile Settings
                </Link>
              </li>
            )}
             {user && (
              <li className="nav-item d-lg-none">
                <button className="nav-link text-danger border-0 bg-transparent w-100 text-start" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
              </li>
            )}
          </ul>
          
          {/* --- MOBILE LOGIN/SIGNUP (d-lg-none) --- */}
          {!user && isNavOpen && (
            <div className="d-lg-none border-top mt-2 pt-3 border-opacity-25 pb-2">
                <div className='d-flex flex-column gap-2'>
                    <Link className="btn btn-outline-primary fw-bold w-100 py-2" to="/login" onClick={closeNav}>Login</Link>
                    <Link className="btn btn-primary fw-bold w-100 shadow-sm py-2" to="/signup" onClick={closeNav}>Sign Up</Link>
                </div>
            </div>
          )}
          
          {/* --- DESKTOP User Actions (d-none d-lg-flex) --- */}
          <div className="d-none d-lg-flex align-items-center gap-3 ms-auto text-nowrap"> 
            
            <ThemeToggle /> 
            <NotificationBell user={user} />

            {!user ? ( 
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary px-4 py-2" to="/login">Login</Link>
                <Link className="btn btn-primary px-4 py-2" to="/signup">Sign Up</Link>
              </div>
            ) : (
              <div className="nav-item dropdown position-relative">
                <button 
                  className="btn btn-light text-primary py-1 px-2 d-flex align-items-center gap-2 border border-primary border-opacity-10 rounded-pill"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="rounded-circle overflow-hidden shadow-sm border border-primary border-opacity-25 d-flex align-items-center justify-content-center bg-primary" style={{ width: '45px', height: '45px' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <span className="text-white fw-bold">{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="fw-bold pe-1 text-nowrap">{user.username}</span>
                  <i className={`bi bi-chevron-${isProfileOpen ? 'up' : 'down'} small opacity-50 pe-1`}></i>
                </button>
                
                {isProfileOpen && (
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 glass-panel show position-absolute mt-2" style={{ right: 0, minWidth: '220px' }}>
                    <li><Link className="dropdown-item py-2 fw-bold" to="/dashboard" onClick={() => setIsProfileOpen(false)}><i className="bi bi-grid-fill me-2 text-primary"></i>My Dashboard</Link></li>
                    <li><hr className="dropdown-divider opacity-10" /></li>
                    
                    <li><Link className="dropdown-item py-2 fw-bold" to="/settings" onClick={() => setIsProfileOpen(false)}><i className="bi bi-gear-fill me-2 text-muted"></i>Profile Settings</Link></li>
                    <li><hr className="dropdown-divider opacity-10" /></li>
                    
                    <li>
                      <button className="dropdown-item py-2 text-danger fw-bold d-flex align-items-center" onClick={handleLogout}>
                        <i className='bi bi-box-arrow-right fs-5 me-2'></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}