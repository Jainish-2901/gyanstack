import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
// FIX: Standard relative paths (../context, ./component, ../services)
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle'; // ThemeToggle is likely in the same components folder
import api from '../services/api'; // Announcement data fetch karne ke liye

// Bell/Notification Dropdown Component
const NotificationBell = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Latest Announcements
  useEffect(() => {
    if (!user) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        // URL ko '/api/announcements?status=approved&limit=5' kiya gaya
        const { data } = await api.get('/announcements?status=approved&limit=5'); 
        
        // Mock Unread Logic: Abhi ke liye, hum assume karte hain ki 
        // pehle 2 announcements unread hain (ya aapke backend logic se aayega)
        const items = data.announcements.map((ann, index) => ({
          ...ann,
          isRead: index >= 2, // Mock: Pehle 2 ko unread rakhte hain
        }));
        
        setAnnouncements(items);
        setUnreadCount(items.filter(i => !i.isRead).length);
        
      } catch (err) {
        console.error("Failed to fetch announcements for header:", err);
        setUnreadCount(0);
      }
      setLoading(false);
    };

    fetchAnnouncements();
  }, [user]);

  // --- AUTOMATIC MARK AS READ LOGIC ---
  const handleDropdownOpen = () => {
    // Dropdown open hote hi, unread items ko read mark karein
    if (unreadCount > 0) {
      const updatedAnn = announcements.map(ann => ({ ...ann, isRead: true }));
      setUnreadCount(0);
      setAnnouncements(updatedAnn);
      // Note: Production mein yahaan 'markAllAsRead' API call hogi.
    }
  };


  if (!user) return null; // Sirf logged-in users ko dikhaye

  return (
    <li className="nav-item dropdown notification-dropdown">
      <a 
        className="nav-link p-2" 
        href="#" 
        id="announcementDropdown" 
        role="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        // Dropdown open hone ke event ko listen karein
        onClick={handleDropdownOpen}
      >
        <i className="bi bi-bell-fill fs-5 position-relative text-primary"></i>
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ top: '8px', right: '0px' }}>
            {unreadCount}
          </span>
        )}
      </a>
      
      {/* Dropdown Menu */}
      <ul className="dropdown-menu dropdown-menu-end shadow-lg" aria-labelledby="announcementDropdown" style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}>
        <li className='dropdown-header fw-bold border-bottom'>Announcements ({unreadCount} New)</li>
        
        {loading && <li className='dropdown-item text-center'><span className="spinner-border spinner-border-sm me-2"></span>Loading...</li>}
        
        {announcements.length === 0 && !loading && <li className='dropdown-item text-muted small'>No recent announcements.</li>}

        {announcements.map((ann, index) => (
          // Ab list item click karne par Mark as Read ki zaroorat nahi hai
          <li key={index} >
            <Link to="/announcements" className={`dropdown-item ${!ann.isRead ? 'bg-light fw-bold' : 'text-muted'}`} style={{ cursor: 'pointer', whiteSpace: 'normal', padding: '0.75rem 1rem' }}>
              <span className='d-block small'>{ann.title}</span>
              <small className='d-block fst-italic text-secondary' style={{fontSize: '0.75rem'}}>
                {ann.isRead ? 'Read' : 'New Update'} - {new Date(ann.createdAt).toLocaleDateString()}
              </small>
            </Link>
          </li>
        ))}
        <li><hr className="dropdown-divider" /></li>
        <li><Link className="dropdown-item text-center small text-primary" to="/announcements">View All Notifications</Link></li>
      </ul>
    </li>
  );
};


// Main Header Component
export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(); 
  };

  const activeClass = ({ isActive }) => (isActive ? 'nav-link active fw-bold text-primary border-bottom border-primary' : 'nav-link');

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow sticky-top">
      <div className="container">
        
        {/* --- 1. BRAND AND MOBILE ACTIONS (Logo, Bell, Toggle) --- */}
        <div className="d-flex align-items-center me-3 w-100"> {/* w-100 for full width mobile */}
          
          {/* LEFT: Logo/Name */}
          <div className="flex-grow-1">
            <Link className="navbar-brand fw-bold fs-4 text-primary" to="/">
              <i className="bi bi-stack me-2"></i>GyanStack
            </Link>
          </div>
          
          {/* RIGHT: Buttons */}
          <div className="d-flex align-items-center">
            
            {/* --- MOBILE/TABLET BELL & THEME (d-lg-none) --- */}
            <div className="d-flex d-lg-none align-items-center me-2">
                <ThemeToggle /> 
                <NotificationBell user={user} />
            </div>
            {/* ----------------------------------------------- */}
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Main Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"> 
            <li className="nav-item page-link">
              <NavLink className={activeClass} to="/">Home</NavLink>
            </li>
            <li className="nav-item page-link">
              <NavLink className={activeClass} to="/browse">Browse</NavLink>
            </li>
            <li className="nav-item page-link">
              <NavLink className={activeClass} to="/request">Request Form</NavLink>
            </li>
            
            {/* --- FIX: MOBILE PROFILE ACTIONS (d-lg-none) --- */}
            {/* Ye list Main Nav Links ke niche left aligned dikhegi */}
            <li className="nav-item d-lg-none border-top mt-2 pt-2 w-100">
                {!user ? ( 
                    <div className='d-flex flex-column'>
                        <Link className="nav-link fw-bold" to="/login">Login</Link>
                        <Link className="btn btn-primary w-100 mt-2" to="/signup">SignUp</Link>
                    </div>
                ) : (
                    // Logged-in user ka mobile menu
                    <div className="d-block py-2">
                        <Link to="/dashboard" className='fw-bold text-dark d-block'>
                            <i className='bi bi-person-circle me-2'></i>
                            {user.username}'s Dashboard
                        </Link>
                        
                        {/* Admin/SuperAdmin Links */}
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                            <>
                                <Link className="d-block small text-primary ps-4" to="/dashboard/admin">Analytics</Link>
                                <Link className="d-block small text-primary ps-4" to="/admin-panel">Content Manager</Link>
                                {user.role === 'superadmin' && (
                                    <Link className="d-block small text-danger ps-4" to="/super-admin-panel">Manage Users</Link>
                                )}
                            </>
                        )}

                        <Link to="/settings" className='d-block small text-muted mt-2'>Profile Settings</Link>
                        <button className="btn btn-sm btn-outline-danger mt-3 w-100" onClick={handleLogout}>
                            <i className='bi bi-box-arrow-right me-2'></i>Logout
                        </button>
                    </div>
                )}
            </li>
            {/* ------------------------------------------------ */}

          </ul>
          
          {/* 2. DESKTOP User Actions (Bell, Theme, Profile) */}
          {/* FIX: ms-auto to push left */}
          <ul className="navbar-nav ms-auto align-items-center d-none d-lg-flex"> 
            
            <ThemeToggle /> 
            
            {/* 1. Notification Bell (Logged-in only) */}
            <NotificationBell user={user} />

            {/* 2. Login/Signup or Profile Dropdown */}
            {!user ? ( 
              <>
                <li className="nav-item ms-lg-2">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary" to="/signup">Sign Up</Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown ms-lg-2">
                <a className="nav-link dropdown-toggle fw-bold text-dark" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className='bi bi-person-circle me-2'></i>
                  {user.username}
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg" aria-labelledby="navbarDropdown">
                  <li><Link className="dropdown-item" to="/dashboard">My Dashboard</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  
                  {/* Admin Links */}
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <>
                      <li><Link className="dropdown-item text-primary" to="/dashboard/admin">Analytics Dashboard</Link></li>
                      <li><Link className="dropdown-item text-primary" to="/admin-panel">Content Manager</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  {/* Super Admin Link */}
                  {user.role === 'superadmin' && (
                    <>
                      <li><Link className="dropdown-item text-danger" to="/super-admin-panel">Manage Users</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  
                  <li>
                    <button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>
                      <i className='bi bi-box-arrow-right me-2'></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}