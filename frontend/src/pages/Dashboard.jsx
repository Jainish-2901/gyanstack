import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout'; // <-- Naya Layout

// Main content component (Student specific)
const StudentDashboardView = ({ user }) => (
  <>
    <h1 className="display-5 fw-bold mb-4" style={{color: '#0056b3'}}>
      Welcome, {user.username}!
    </h1>
    <div className={`alert alert-info border-0 shadow-sm`} style={{backgroundColor: '#e3f2fd', color: '#0056b3', borderLeft: '5px solid #007bff'}}>
      <i className='bi bi-info-circle-fill me-2'></i>
      Aapka role hai: <span className="fw-bold">{user.role.toUpperCase()}</span>.
      Yahaan aapko student-specific features milenge.
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