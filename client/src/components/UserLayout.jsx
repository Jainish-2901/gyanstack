import React, { useState } from 'react';
import UserSidebar from './UserSidebar';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';

export default function UserLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    // Fix for background scroll when sidebar is open on mobile
    React.useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Mapping path names to page titles
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'User Dashboard';
        if (path === '/dashboard/saved') return 'Saved Resources';
        if (path === '/request') return 'Content Request';
        if (path === '/dashboard/inquiries') return 'My Inquiries';
        if (path === '/settings') return 'Account Settings';
        return 'GyanStack Portal';
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" 
                    style={{ zIndex: 1090 }}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <UserSidebar show={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

            <div className="dashboard-main">
                <header className="dashboard-header justify-content-between">
                    <div className="d-flex align-items-center">
                        <button 
                            className="btn btn-primary dashboard-toggle-btn me-3 p-1 px-2"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <i className="bi bi-list fs-4"></i>
                        </button>
                        <h4 className="mb-0 fw-bold d-none d-md-block text-primary">{getPageTitle()}</h4>
                        <h5 className="mb-0 fw-bold d-md-none text-primary">{getPageTitle()}</h5>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <Link to="/" className="btn btn-outline-primary btn-sm rounded-pill px-3 d-none d-sm-flex align-items-center">
                            <i className="bi bi-house-door-fill me-2"></i>
                            Return to Website
                        </Link>
                        <ThemeToggle />
                        <NotificationBell user={user} />
                        
                        <Link to="/settings" className="d-none d-md-flex flex-column text-end text-decoration-none text-body hover-opacity">
                            <span className="fw-bold small">{user?.username}</span>
                            <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>{user?.role}</small>
                        </Link>
                        
                        <Link to="/settings" className="rounded-circle overflow-hidden shadow-sm border border-primary border-2 bg-primary d-flex align-items-center justify-content-center hover-scale transition-all" style={{ width: '40px', height: '40px' }}>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <span className="text-white fw-bold">{user?.username.charAt(0).toUpperCase()}</span>
                            )}
                        </Link>
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
