import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Sahi Path
import LoadingScreen from './LoadingScreen'; // FIX: './' (Same folder me hone ki ummeed)

// Dashboard Menu Items
const getMenuItems = (role) => {
  // Common links for all users
  const allLinks = [
    // 1. HOME DASHBOARD (Student ka default landing, Admin/SuperAdmin yahaan se shuru nahi karte)
    // Ab ye link Admin/SuperAdmin ke liye exclude ho jayega, taaki duplication na ho.
    { name: 'Home Dashboard', path: '/dashboard', icon: 'bi-grid-fill', roles: ['student'] },
    { name: 'Saved Content', path: '/dashboard/saved', icon: 'bi-bookmark-fill', roles: ['student'] },
    { name: 'Request Content', path: '/request', icon: 'bi-megaphone-fill', roles: ['student'] },

    // Common links for everyone
    { name: 'Profile Settings', path: '/settings', icon: 'bi-gear-fill', roles: ['student', 'admin', 'superadmin'] },
    
    // 2. ADMIN LINKS (Analytics aur Content Management)
    // Ye Admin/SuperAdmin ka main landing point hai.
    { name: 'Analytics Dashboard', path: '/dashboard/admin', icon: 'bi-bar-chart-line-fill', roles: ['admin', 'superadmin'] },
    { name: 'Content Manager', path: '/admin-panel', icon: 'bi-cloud-arrow-up-fill', roles: ['admin', 'superadmin'] },
    { name: 'View Announcements', path: '/announcements', icon: 'bi-megaphone-fill', roles: ['admin', 'superadmin'] },
  
    // 3. SUPER ADMIN LINKS
    { name: 'Manage All', path: '/super-admin-panel', icon: 'bi-person-gear', roles: ['superadmin'] },
  ];

  // Role ke hisaab se links ko filter karein
  return allLinks.filter(link => link.roles.includes(role));
};

export default function DashboardLayout({ children, isSuperAdminView = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Loading aur Unauthenticated check (agar router fail ho to)
  if (loading) return <LoadingScreen text="Loading Dashboard..." />;
  if (!user) return null;

  const role = user.role;
  const menuItems = getMenuItems(role);
  
  // Active path ko Super Admin ke liye manually set karein
  const activePath = isSuperAdminView ? '/super-admin-panel' : location.pathname;

  return (
    <div className="container-fluid dashboard-layout">
      <div className="row g-4">
        {/* Left Sidebar (Attractive Design) */}
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="glass-card sticky-top sidebar-card overflow-hidden" style={{ top: '100px', zIndex: 1000 }}>
            <div className="card-header border-0 bg-transparent py-3 text-center">
              <h5 className="mb-0 fw-bold text-primary fs-5">
                <i className="bi bi-person-circle fs-4 d-block mb-1"></i>
                {user.username} 
              </h5>
              <small className="text-muted" style={{fontSize: '0.8rem'}}>{user.role.toUpperCase()} Portal</small>
            </div>
            <div className="list-group list-group-flush pb-2">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`list-group-item list-group-item-action border-0 py-2 ps-4 d-flex align-items-center ${activePath === item.path ? 'active' : ''}`}
                  style={activePath === item.path ? { borderRadius: '0 !important', fontSize: '0.95rem' } : { fontSize: '0.95rem' }}
                >
                  <i className={`bi ${item.icon} me-3 fs-6 ${activePath === item.path ? 'text-white' : 'text-primary'}`}></i>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="col-lg-9 col-md-8">
          <div className="main-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}