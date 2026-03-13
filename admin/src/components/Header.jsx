import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';

const NotificationBell = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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
        // Count how many are strictly newer than lastSeenId
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

    // When opening the dropdown, mark everything as read and persist the latest ID
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
      <a
        className="nav-link p-2"
        href="#"
        onClick={toggleDropdown}
      >
        <i className="bi bi-bell-fill fs-5 position-relative text-primary"></i>
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: '8px', right: '0px' }}>
            {unreadCount}
          </span>
        )}
      </a>

      {isOpen && (
        <ul className="dropdown-menu dropdown-menu-end shadow-lg show position-absolute glass-panel border-0" style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto', right: 0, top: '120%', zIndex: 1050 }}>
          <li className='dropdown-header fw-bold border-bottom d-flex justify-content-between align-items-center bg-transparent'>
            <span className="text-primary">Announcements ({unreadCount} New)</span>
            <button className="btn-close" style={{ fontSize: '0.6rem' }} onClick={() => setIsOpen(false)}></button>
          </li>

          {loading && <li className='dropdown-item text-center my-3 bg-transparent'><span className="spinner-border spinner-border-sm me-2 text-primary"></span><span className="text-muted">Loading...</span></li>}
          {announcements.length === 0 && !loading && <li className='dropdown-item text-muted small my-3 text-center bg-transparent'>No recent announcements.</li>}

          {announcements.map((ann, index) => (
            <li key={index} >
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
      )}
    </div>
  );
};


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

  const handleLogout = () => {
    setIsNavOpen(false);
    setIsProfileOpen(false);
    logout();
  };

  const closeNav = () => setIsNavOpen(false);

  const activeClass = ({ isActive }) => (isActive ? 'nav-link active fw-bold text-primary border-bottom border-primary px-1 mx-2 text-nowrap' : 'nav-link px-1 mx-2 text-nowrap');

  return (
    <nav className="navbar navbar-expand-lg border-0 fancy-header my-3 mx-2 mx-lg-4 sticky-top" style={{ zIndex: 1050 }}>
      <div className="container-fluid px-3">

        {/* --- 1. BRAND AND MOBILE ACTIONS --- */}
        <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto">

          <div className="flex-grow-1 text-nowrap">
            <Link className="navbar-brand fw-bold fs-4 text-primary text-nowrap" to="/" onClick={closeNav}>
              <i className="bi bi-stack me-2"></i>GyanStack
            </Link>
          </div>

          <div className="d-flex align-items-center d-lg-none">
            <div className="d-flex align-items-center me-3 gap-2">
              <ThemeToggle />
              <NotificationBell user={user} />
            </div>

            <button
              className="navbar-toggler border-0 shadow-none focus-ring focus-ring-primary px-0"
              type="button"
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-expanded={isNavOpen}
            >
              <i className={`bi fs-1 text-primary ${isNavOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>

        <div className={`navbar-collapse ${isNavOpen ? 'd-block mt-3 border-top pt-3' : 'collapse d-lg-flex'}`} id="navbarNav">
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item page-link mb-2 mb-lg-0">
              <NavLink className={activeClass} to="/dashboard/admin" onClick={closeNav}>Dashboard</NavLink>
            </li>
            <li className="nav-item page-link mb-2 mb-lg-0">
              <NavLink className={activeClass} to="/admin-panel" onClick={closeNav}>Content Manager</NavLink>
            </li>
          </ul>

          {/* --- MOBILE PROFILE ACTIONS (d-lg-none) --- */}
          {isNavOpen && (
            <div className="d-lg-none border-top mt-2 pt-3 border-opacity-25 pb-2">
              {!user ? (
                <div className='d-flex flex-column gap-2'>
                  <Link className="btn btn-outline-primary fw-bold w-100 py-2" to="/login" onClick={closeNav}>Login</Link>
                  <Link className="btn btn-primary fw-bold w-100 shadow-sm py-2" to="/signup" onClick={closeNav}>Sign Up</Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <Link to="/dashboard" className='btn btn-light text-primary fw-bold w-100 text-start d-flex align-items-center shadow-sm py-3' onClick={closeNav}>
                    <div className="rounded-circle border border-primary border-2 me-3 overflow-hidden shadow-sm d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <i className='bi bi-person-circle fs-1'></i>
                      )}
                    </div>
                    <div className="d-flex flex-column">
                      <span className="fs-5 lh-1 mb-1">{user.username}</span>
                      <small className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>My Dashboard</small>
                    </div>
                  </Link>

                  {/* Admin Links */}
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <div className="ps-3 border-start border-primary border-3 ms-2 mt-2 py-1 d-flex flex-column gap-3">
                      <Link className="text-decoration-none text-primary fw-bold" to="/dashboard/admin" onClick={closeNav}><i className="bi bi-bar-chart-fill me-2 bg-light p-2 rounded"></i> Analytics</Link>
                      <Link className="text-decoration-none text-primary fw-bold" to="/admin-panel" onClick={closeNav}><i className="bi bi-cloud-arrow-up-fill me-2 bg-light p-2 rounded"></i> Content Manager</Link>
                      {user.role === 'superadmin' && (
                        <Link className="text-decoration-none text-danger fw-bold" to="/super-admin-panel" onClick={closeNav}><i className="bi bi-shield-lock-fill me-2 bg-light p-2 rounded"></i> Manage Users</Link>
                      )}
                    </div>
                  )}

                  <Link to="/settings" className='btn btn-link text-muted text-start mt-3 text-decoration-none fw-medium p-0' onClick={closeNav}><i className="bi bi-gear-fill me-2"></i> Profile Settings</Link>

                  <button className="btn btn-danger fw-bold mt-4 d-flex align-items-center justify-content-center py-2 shadow-sm rounded-pill" onClick={handleLogout}>
                    <i className='bi bi-box-arrow-right fs-5 me-2'></i> LOGOUT
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- DESKTOP User Actions (d-none d-lg-flex) --- */}
          <div className="d-none d-lg-flex align-items-center gap-2 ms-auto text-nowrap">

            <ThemeToggle />
            <NotificationBell user={user} />

            {!user ? (
              <div className="d-flex gap-2 ms-2">
                <Link className="btn btn-outline-primary fw-bold px-4 rounded-pill" to="/login">Login</Link>
              </div>
            ) : (
              <div className="nav-item dropdown position-relative ms-2">
                <button
                  className="btn btn-light text-primary py-1 px-2 d-flex align-items-center gap-2 border border-primary border-opacity-10 rounded-pill"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="rounded-circle overflow-hidden shadow-sm border border-primary border-opacity-25" style={{ width: '45px', height: '45px' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <i className='bi bi-person-circle fs-4'></i>
                    )}
                  </div>
                  <span className="text-nowrap">{user.username}</span>
                  <i className={`bi ms-2 fs-6 bi-chevron-${isProfileOpen ? 'up' : 'down'}`}></i>
                </button>

                {isProfileOpen && (
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 glass-panel show position-absolute" style={{ right: 0, top: '120%', minWidth: '220px', zIndex: 1050 }}>
                    <li><Link className="dropdown-item py-2 fw-bold" to="/dashboard/admin" onClick={() => setIsProfileOpen(false)}><i className="bi bi-grid-fill me-2 text-primary"></i>Admin Dashboard</Link></li>
                    <li><hr className="dropdown-divider opacity-25" /></li>

                    {/* Admin Links */}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <>
                        <li><Link className="dropdown-item py-2 text-primary" to="/dashboard/admin" onClick={() => setIsProfileOpen(false)}><i className="bi bi-bar-chart-fill me-2"></i>Analytics</Link></li>
                        <li><Link className="dropdown-item py-2 text-primary" to="/admin-panel" onClick={() => setIsProfileOpen(false)}><i className="bi bi-cloud-arrow-up-fill me-2"></i>Content Manager</Link></li>
                        <li><hr className="dropdown-divider opacity-25" /></li>
                      </>
                    )}
                    {/* Super Admin Link */}
                    {user.role === 'superadmin' && (
                      <>
                        <li><Link className="dropdown-item py-2 text-danger fw-bold" to="/super-admin-panel" onClick={() => setIsProfileOpen(false)}><i className="bi bi-shield-lock-fill me-2"></i>Manage Users</Link></li>
                        <li><hr className="dropdown-divider opacity-25" /></li>
                      </>
                    )}

                    <li><Link className="dropdown-item py-2" to="/settings" onClick={() => setIsProfileOpen(false)}><i className="bi bi-gear-fill me-2 text-secondary"></i>Account Settings</Link></li>
                    <li><hr className="dropdown-divider opacity-25" /></li>

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