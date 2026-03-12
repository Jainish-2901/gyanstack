import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout'; // <-- Naya Layout

// Main content component (Student specific)
const StudentDashboardView = ({ user }) => (
  <>
    <h3 className="fw-bold mb-4 text-primary">
      Welcome, {user.username}!
    </h3>
    <div className={`alert border-0 shadow-sm glass-panel text-primary d-flex align-items-center`}>
      <i className='bi bi-info-circle-fill fs-5 me-2'></i>
      <div>
        <span>Aapka role hai: <span className="fw-bold">{user.role.toUpperCase()}</span>. Yahaan aapko student-specific features milenge.</span>
      </div>
    </div>
    
    <div className="row g-4 mt-4">
      {/* Saved Content Card */}
      <div className="col-md-6">
        <div className="card shadow-lg h-100 border-0 rounded-lg hover-scale">
          <div className="card-body">
            <h4 className="card-title fw-bold text-primary"><i className='bi bi-bookmark-star-fill me-2'></i> My Saved Content</h4>
            <p className="card-text text-muted">Yahaan aapke saved notes aur padhai ka progress dikhega.</p>
            <Link to="/dashboard/saved" className="btn btn-sm btn-primary mt-2">
              <i className='bi bi-eye me-2'></i>
              View Saved
            </Link>
          </div>
        </div>
      </div>
      
      {/* Settings Card */}
      <div className="col-md-6">
        <div className="card shadow-lg h-100 border-0 rounded-lg hover-scale">
          <div className="card-body">
            <h4 className="card-title fw-bold text-secondary"><i className='bi bi-gear-fill me-2'></i> Account Settings</h4>
            <p className="card-text text-muted">Update your personal details and change password.</p>
            <Link to="/settings" className="btn btn-sm btn-secondary mt-2">
              <i className='bi bi-person-lines-fill me-2'></i>
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
);


export default function Dashboard() {
  const { user, loading } = useAuth();
  
  if (loading || !user) return null; // Loading ya Not Authenticated
  
  // Ab, Admin/SuperAdmin ko redirect karne ka kaam DashboardLayout sambhal lega
  // Ya fir hum maan lete hain ki router ne admin ko /dashboard/admin par bheja hai
  
  return (
    <DashboardLayout>
      <StudentDashboardView user={user} />
    </DashboardLayout>
  );
}
