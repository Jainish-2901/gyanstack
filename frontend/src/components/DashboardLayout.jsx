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
        <div className="col-lg-3 col-md-5">
          <div className="card shadow-lg sticky-top border-0 rounded-lg sidebar-card" style={{ top: '80px', background: 'linear-gradient(145deg, #ffffff, #e6e6e6)' }}>
            <div className="card-header bg-primary text-white border-0 rounded-top-lg" style={{ background: 'linear-gradient(90deg, #007bff, #0056b3)' }}>
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-person-circle me-2"></i>
                {user.username} 
              </h5>
              <small style={{opacity: 0.8}}>{user.role.toUpperCase()} Portal</small>
            </div>
            <div className="list-group list-group-flush pt-2 pb-2">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  // Stylish active state
                  className={`list-group-item list-group-item-action border-0 py-3 ps-4 ${activePath === item.path ? 'text-primary' : 'text-dark'}`}
                  style={activePath === item.path ? { fontWeight: 'bold', borderLeft: '5px solid #0056b3', background: '#e0f7fa' } : {}}
                >
                  <i className={`bi ${item.icon} me-3`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9 col-md-7">
          <div className="main-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}