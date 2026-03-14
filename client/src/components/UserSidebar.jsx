import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserSidebar({ show, onMobileClose }) {
    const { user, logout } = useAuth();

    const navLinks = [
        { path: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard Home', roles: ['student', 'admin', 'superadmin'] },
        { path: '/dashboard/saved', icon: 'bi-bookmark-fill', label: 'Saved Content', roles: ['student', 'admin', 'superadmin'] },
        { path: '/request', icon: 'bi-megaphone-fill', label: 'Request Content', roles: ['student', 'admin', 'superadmin'] },
        { path: '/dashboard/inquiries', icon: 'bi-chat-left-dots-fill', label: 'My Inquiries', roles: ['student', 'admin', 'superadmin'] },
        { path: '/settings', icon: 'bi-gear-fill', label: 'Profile Settings', roles: ['student', 'admin', 'superadmin'] },
    ];

    return (
        <aside className={`dashboard-sidebar ${show ? 'show' : ''}`}>
            <div className="sidebar-brand d-flex align-items-center justify-content-between">
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={onMobileClose}>
                    <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '35px' }} />
                    <span>GyanStack</span>
                </Link>
                {/* Close button for Mobile (<= 490px) */}
                <button 
                  className="btn btn-link text-primary d-lg-none sidebar-close-btn p-0" 
                  onClick={onMobileClose}
                >
                  <i className="bi bi-x-lg fs-4"></i>
                </button>
            </div>

            <div className="flex-grow-1 overflow-y-auto py-3">
                <div className="px-4 mb-3">
                    <small className="text-muted fw-bold text-uppercase tracking-wider">Student Portal</small>
                </div>
                
                {navLinks.filter(link => link.roles.includes(user?.role)).map((link, index) => (
                    <NavLink 
                        key={index} 
                        to={link.path} 
                        className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                        onClick={onMobileClose}
                    >
                        <i className={`bi ${link.icon}`}></i>
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                <div className="mx-3 mt-4 pt-4 border-top border-opacity-10">
                    <Link to="/" className="sidebar-nav-link text-primary fw-bold" onClick={onMobileClose}>
                        <i className="bi bi-house-door-fill"></i>
                        <span>Return to Website</span>
                    </Link>
                </div>
            </div>

            <div className="p-3 border-top border-opacity-10">
                <div className="glass-panel p-3 d-flex align-items-center">
                    <div className="rounded-circle overflow-hidden shadow-sm border border-primary border-2 bg-primary me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span className="text-white fw-bold">{user?.username.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                        <h6 className="mb-0 text-truncate small">{user?.username}</h6>
                        <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>{user?.role}</small>
                    </div>
                    <button className="btn btn-link text-danger p-0 ms-2" onClick={logout} title="Logout">
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
