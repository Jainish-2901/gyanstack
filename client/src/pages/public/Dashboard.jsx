import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyRequests } from '../../hooks/useRequests';

// Main content component (Student specific)
const StudentDashboardView = ({ user, requests, fetching }) => (
  <>
    <h3 className="fw-bold mb-4 text-primary">
      Welcome, {user.username}!
    </h3>
    <div className={`alert border-0 shadow-sm glass-panel text-primary d-flex align-items-center mb-4`}>
      <i className='bi bi-info-circle-fill fs-5 me-2'></i>
      <div>
        <span>Aapka role hai: <span className="fw-bold">{user.role.toUpperCase()}</span>. Yahaan aapko student-specific features milenge.</span>
      </div>
    </div>
    
    <div className="row g-4 mb-5">
      {/* Saved Content Card */}
      <div className="col-md-4">
        <div className="card shadow-lg h-100 border-0 rounded-lg hover-scale">
          <div className="card-body">
            <h5 className="card-title fw-bold text-primary"><i className='bi bi-bookmark-star-fill me-2'></i> Saved Content</h5>
            <p className="card-text text-muted small">Access your bookmarks and study progress.</p>
            <Link to="/dashboard/saved" className="btn btn-sm btn-primary mt-2">
              <i className='bi bi-eye me-2'></i> View All
            </Link>
          </div>
        </div>
      </div>
      
      {/* Inquiries Card */}
      <div className="col-md-4">
        <div className="card shadow-lg h-100 border-0 rounded-lg hover-scale">
          <div className="card-body">
            <h5 className="card-title fw-bold text-success"><i className='bi bi-chat-left-dots-fill me-2'></i> Support Inquiries</h5>
            <p className="card-text text-muted small">Track messages sent to the GyanStack team.</p>
            <Link to="/dashboard/inquiries" className="btn btn-sm btn-success mt-2 text-white">
              <i className='bi bi-clock-history me-2'></i> Check Status
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="col-md-4">
        <div className="card shadow-lg h-100 border-0 rounded-lg hover-scale">
          <div className="card-body">
            <h5 className="card-title fw-bold text-secondary text-truncate shadow-text"><i className='bi bi-gear-fill me-2'></i> Settings</h5>
            <p className="card-text text-muted small">Update your profile and security details.</p>
            <Link to="/settings" className="btn btn-sm btn-secondary mt-2">
              <i className='bi bi-person-lines-fill me-2'></i> Settings
            </Link>
          </div>
        </div>
      </div>

      {/* NEW: AI Assistant Card */}
      <div className="col-12 mt-4">
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
          <div className="card-body p-4 text-white d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="d-flex align-items-center mb-3 mb-md-0">
               <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" 
                    style={{ width: '70px', height: '70px', flexShrink: 0 }}>
                 <i className="bi bi-robot fs-1 text-primary"></i>
               </div>
               <div>
                 <h4 className="fw-bold mb-1">Meet your AI Study Buddy</h4>
                 <p className="mb-0 opacity-75">Ask me anything about notes, PYQs, or preparation tips!</p>
               </div>
            </div>
            <button 
              className="btn btn-light text-primary fw-bold px-4 py-2 rounded-pill shadow-sm"
              onClick={() => window.dispatchEvent(new Event('toggle-ai-chat'))}
            >
              Start Chatting <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* User Content Requests Section */}
    <div className="glass-panel p-4 shadow-sm border-0 rounded-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Recent Content Requests</h4>
          <p className="text-muted small mb-0">Track the status of topics you've asked for.</p>
        </div>
        <Link to="/request" className="btn btn-primary btn-sm rounded-pill px-3">
          <i className="bi bi-plus-lg me-1"></i> New Request
        </Link>
      </div>

      {fetching ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-4 border-dashed">
          <p className="text-muted mb-0 small">No requests submitted yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {requests.slice(0, 3).map((req) => (
            <div key={req._id} className="col-12">
              <div className="list-group-item bg-light border-0 rounded-4 p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1 small">{req.topic}</h6>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-clock me-1"></i>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <span className={`badge rounded-pill ${
                  req.status === 'fulfilled' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                }`} style={{ fontSize: '0.65rem' }}>
                  {req.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
          {requests.length > 3 && (
            <div className="col-12 text-center mt-2">
              <Link to="/request" className="text-primary small text-decoration-none fw-bold">
                View All {requests.length} Requests <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  </>
);

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  
  // Use TanStack Query hook
  const { data: requests = [], isLoading: fetching } = useMyRequests();
  
  if (authLoading || !user) return null; 
  
  return (
    <StudentDashboardView user={user} requests={requests} fetching={fetching} />
  );
}
