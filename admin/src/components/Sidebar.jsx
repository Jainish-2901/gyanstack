import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ show, onMobileClose }) {
    const { user, logout } = useAuth();

    const navLinks = [
        { path: '/dashboard/admin', icon: 'bi-grid-1x2-fill', label: 'Admin Analytics', roles: ['admin', 'superadmin'] },
        { path: '/admin-panel', icon: 'bi-file-earmark-text-fill', label: 'Content Manager', roles: ['admin', 'superadmin'] },
        { path: '/dashboard/my-announcements', icon: 'bi-megaphone-fill', label: 'My Announcements', roles: ['admin'] },
        { path: '/announcements', icon: 'bi-megaphone-fill', label: 'View Announcements', roles: ['admin', 'superadmin'] },
        { path: '/dashboard/requests', icon: 'bi-chat-left-dots-fill', label: 'User Requests', roles: ['admin', 'superadmin'] },
        { path: '/dashboard/users', icon: 'bi-people-fill', label: 'Manage Users', roles: ['superadmin'] },
        { path: '/dashboard/global-content', icon: 'bi-box-seam-fill', label: 'Global Content', roles: ['superadmin'] },
        { path: '/dashboard/announcements-manage', icon: 'bi-bell-fill', label: 'All Announcements', roles: ['superadmin'] },
        { path: '/dashboard/contact', icon: 'bi-envelope-paper-fill', label: 'Contact Inquiries', roles: ['superadmin'] },
        { path: '/settings', icon: 'bi-gear-fill', label: 'Profile Settings', roles: ['admin', 'superadmin'] },
    ];

    return (
        <aside className={`dashboard-sidebar ${show ? 'show' : ''}`}>
            <div className="sidebar-brand">
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={onMobileClose}>
                    <img src="/logo.png" alt="Logo" className="me-2" style={{ height: '35px' }} />
                    <span className="fw-bold fs-5 gradient-text">GyanStack Admin</span>
                </Link>
            </div>

            <div className="sidebar-nav-container flex-grow-1 overflow-y-auto py-3">
                <div className="px-4 mb-3">
                    <small className="text-muted fw-bold text-uppercase tracking-wider">Dashboard Menu</small>
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
            </div>

            <div className="p-3 border-top border-opacity-10">
                <div className="glass-panel p-3 d-flex align-items-center">
                    <Link 
                        to="/settings" 
                        onClick={onMobileClose} 
                        className="d-flex align-items-center flex-grow-1 text-decoration-none text-reset overflow-hidden hover-opacity transition-all"
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="rounded-circle overflow-hidden shadow-sm border border-primary border-2 bg-primary me-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <span className="text-white fw-bold">{user?.username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 text-truncate small fw-bold">{user?.username}</h6>
                            <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>{user?.role}</small>
                        </div>
                    </Link>
                    <button className="btn btn-link text-danger p-0 ms-2" onClick={logout} title="Logout" id="logout-btn">
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
