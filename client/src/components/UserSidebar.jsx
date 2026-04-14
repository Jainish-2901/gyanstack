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
            {/* SIDEBAR HEADER: Brand Left, Close Right */}
            <div className="sidebar-brand d-flex align-items-center justify-content-between px-3 py-2 border-bottom border-opacity-10">
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={onMobileClose}>
                    <img src="/logo_v2.png" alt="Logo" className="me-2" style={{ height: '32px' }} />
                    <span className="fw-bold fs-5">GyanStack</span>
                </Link>

                {/* Mobile Close Button (Visible only on small screens) */}
                <button
                    className="btn btn-link text-muted d-lg-none p-0 border-0 shadow-none"
                    onClick={onMobileClose}
                >
                    <i className="bi bi-x-lg fs-4"></i>
                </button>
            </div>

            {/* NAVIGATION LINKS */}
            <div className="sidebar-nav-container flex-grow-1 overflow-y-auto py-4">
                <div className="px-4 mb-3">
                    <small className="text-muted fw-bold text-uppercase x-small tracking-wider">Student Portal</small>
                </div>

                {navLinks.filter(link => link.roles.includes(user?.role)).map((link, index) => (
                    <NavLink
                        key={index}
                        to={link.path}
                        end={link.path === '/dashboard'}
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

            {/* USER PROFILE CARD (BOTTOM) */}
            <div className="p-3 border-top border-opacity-10">
                <div className="glass-panel p-2 d-flex align-items-center border-0 shadow-sm">
                    <Link
                        to="/settings"
                        onClick={onMobileClose}
                        className="d-flex align-items-center flex-grow-1 text-decoration-none text-reset overflow-hidden transition-all"
                    >
                        <div className="rounded-circle overflow-hidden border border-primary border-2 bg-primary me-2 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs" style={{ width: '38px', height: '38px' }}>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <span className="text-white fw-bold x-small">{user?.username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="mb-0 text-truncate small fw-bold" style={{ color: 'var(--text-primary)' }}>{user?.username}</h6>
                            <small className="text-uppercase x-small" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{user?.role}</small>
                        </div>
                    </Link>

                    <button className="btn btn-link text-danger p-1 ms-1 border-0 shadow-none" onClick={logout} title="Logout">
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </button>
                </div>
            </div>

            <style>{`
                .sidebar-nav-link {
                    display: flex;
                    align-items: center;
                    padding: 0.8rem 1.5rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    gap: 12px;
                }
                .sidebar-nav-link i { font-size: 1.1rem; }
                .sidebar-nav-link.active {
                    background: var(--brand-50);
                    color: var(--primary);
                    border-left: 4px solid var(--primary);
                    font-weight: 700;
                }
                [data-bs-theme="dark"] .sidebar-nav-link.active {
                    background: rgba(52, 211, 153, 0.1);
                }
                .sidebar-nav-link:hover:not(.active) {
                    background: rgba(0,0,0,0.03);
                    transform: translateX(4px);
                }
                .x-small { font-size: 0.7rem; }
            `}</style>
        </aside>
    );
}