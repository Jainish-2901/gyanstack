import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';
import CategoryManager from '../../components/CategoryManager';
// --- NAYA IMPORT ---
import DashboardLayout from '../../components/DashboardLayout'; 
// -------------------

// Helper component to render the cards for mobile view
const UserCardMobile = ({ user, handleRoleChange, handleUserDelete }) => (
    <div className="card shadow-sm mb-3 border-0 rounded-lg">
        <div className="card-body">
            <div className="data-item fw-bold text-primary mb-2" data-label="Name">{user.username}</div>
            <div className="data-item small mb-2" data-label="Email">{user.email}</div>
            <div className="data-item mb-3" data-label="Role">
                <span className={`badge ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'admin' ? 'bg-warning' : 'bg-secondary'}`}>{user.role}</span>
            </div>
            <div className="card-actions">
                <div className="scroll-selection mb-2">
                    <button className="btn btn-sm btn-outline-success" onClick={() => handleRoleChange(user._id, 'student')}>Student</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleRoleChange(user._id, 'admin')}>Admin</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRoleChange(user._id, 'superadmin')} disabled={user.role === 'superadmin'}>SuperAdmin</button>
                </div>
                <button 
                  className="btn btn-sm btn-danger w-100" 
                  onClick={() => handleUserDelete(user._id)}
                  disabled={user.role === 'superadmin'}
                >
                  <i className="bi bi-trash-fill me-1"></i> Delete User
                </button>
            </div>
        </div>
    </div>
);

const AnnouncementCardMobile = ({ ann, handleAnnouncementStatus, handleEditClick, handleAnnouncementDelete }) => {
    const statusColor = ann.status === 'approved' ? 'success' : ann.status === 'rejected' ? 'danger' : 'warning text-dark';
    
    return (
        <div className="card shadow-sm mb-3 border-0 rounded-lg">
            <div className="card-body">
                <div className="data-item" data-label="Title">{ann.title}</div>
                <div className="data-item" data-label="Requested By">{ann.requestedBy?.username || 'N/A'}</div>
                <div className="data-item" data-label="Status">
                    <span className={`badge bg-${statusColor}`}>{ann.status}</span>
                </div>
                <div className="card-actions">
                    <div className="scroll-selection">
                        <button className="btn btn-sm btn-success" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}>Approve</button>
                        <button className="btn btn-sm btn-warning" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}>Reject</button>
                        <button className="btn btn-sm btn-info" onClick={() => handleEditClick(ann)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAnnouncementDelete(ann._id)}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function SuperAdminPanel() {
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for Edit Modal
  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);

  // States for New Announcement (Super Admin)
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  // Data Fetch karein (Users aur Announcements)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Users
      const { data: usersData } = await api.get('/admin/users');
      setUsers(usersData.users);

      // Announcements
      const { data: annData } = await api.get('/announcements/all');
      setAnnouncements(annData.announcements);
      
    } catch (err) {
      console.error("Full Error Object:", err);
      const msg = err.response?.data?.message || err.message || 'Unknown Error';
      const status = err.response?.status ? ` (Status: ${err.response.status})` : '';
      setError(`Failed to load data: ${msg}${status}`);
    }
    setLoading(false);
  };

  // Jab page load ho, data fetch karein
  useEffect(() => {
    fetchData();
  }, []);

  // Role badalne ka function
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchData(); 
    } catch (err) {
      console.error("Error changing role:", err);
      setError("Failed to update user role.");
    }
  };

  // User Delete Function
  const handleUserDelete = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY delete this user? All their uploaded content will also be removed.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData(); 
      setError(''); // Clear errors on success
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  // Announcement Status/Delete Functions
  const handleAnnouncementStatus = async (id, newStatus) => {
    try {
      await api.put(`/announcements/${id}/status`, { status: newStatus });
      fetchData(); 
    } catch (err) {
      console.error("Error updating announcement status:", err);
      setError("Failed to update announcement status.");
    }
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchData(); 
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("Failed to delete announcement.");
    }
  };

  // Add Announcement Logic
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/announcements/request', { title: annTitle, content: annContent });
      setSuccess('Announcement published successfully!');
      setAnnTitle('');
      setAnnContent('');
      fetchData(); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    }
    setAnnLoading(false);
  };

  // Edit Modal ke liye functions
  const handleEditClick = (announcement) => {
    setCurrentAnn(announcement);
    setIsEditingAnn(true);
  };
  
  const handleUpdateAnn = (updatedItem) => {
    setAnnouncements(announcements.map(ann => 
      ann._id === updatedItem._id ? updatedItem : ann
    ));
  };
  
  if (loading) {
    return <LoadingScreen text="Loading Super Admin data..." />;
  }

  // --- DASHBOARD LAYOUT MEIN WRAP KAREIN ---
  return (
    <DashboardLayout isSuperAdminView={true}>
      <h3 className="fw-bold mb-4 text-danger">
        Super Admin Panel
      </h3>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        {/* Left Column: User/Announcement Management */}
        <div className="col-lg-8">
          {/* 1. Manage User Roles */}
          <div className="card shadow-lg mb-4 border-0 rounded-lg">
            <div className="card-header bg-light"><h3 className="fw-bold mb-0 text-dark">Manage User Roles</h3></div>
            <div className="card-body p-0 responsive-card-view"> 
              
              {/* DESKTOP VIEW: Table */}
              <div className="table-responsive d-none d-lg-block">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td><span className={`badge ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'admin' ? 'bg-warning' : 'bg-secondary'}`}>{user.role}</span></td>
                        <td>
                          <div className="d-flex gap-2">
                            <div className="scroll-selection">
                              <button className="btn btn-sm btn-outline-success" onClick={() => handleRoleChange(user._id, 'student')}>Student</button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => handleRoleChange(user._id, 'admin')}>Admin</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleRoleChange(user._id, 'superadmin')} disabled={user.role === 'superadmin'}>SuperAdmin</button>
                            </div>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => handleUserDelete(user._id)}
                              disabled={user.role === 'superadmin'}
                              title="Delete User"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* MOBILE VIEW: Cards */}
              <div className="d-lg-none p-3">
                {users.map(user => (
                    <UserCardMobile key={user._id} user={user} handleRoleChange={handleRoleChange} handleUserDelete={handleUserDelete} />
                ))}
              </div>

            </div>
          </div>

          {/* 2. Manage All Announcements */}
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-light"><h3 className="fw-bold mb-0 text-dark">Manage All Announcements</h3></div>
            <div className="card-body p-0 responsive-card-view">
              {announcements.length === 0 ? (
                <p className='text-muted p-3'>No announcements found.</p>
              ) : (
                <>
                  {/* DESKTOP VIEW: Table */}
                  <div className="table-responsive d-none d-lg-block">
                    <table className="table table-striped table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Requested By</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {announcements.map(ann => (
                          <tr key={ann._id}>
                            <td>{ann.title}</td>
                            <td>{ann.requestedBy?.username || 'N/A'}</td>
                            <td>
                              <span className={`badge ${
                                ann.status === 'approved' ? 'bg-success' :
                                ann.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                              }`}>
                                {ann.status}
                              </span>
                            </td>
                            <td>
                              <div className="scroll-selection">
                                <button className="btn btn-sm btn-success" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}>Approve</button>
                                <button className="btn btn-sm btn-warning" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}>Reject</button>
                                <button className="btn btn-sm btn-info" onClick={() => handleEditClick(ann)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleAnnouncementDelete(ann._id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* MOBILE VIEW: Cards */}
                  <div className="d-lg-none p-3">
                    {announcements.map(ann => (
                        <AnnouncementCardMobile 
                            key={ann._id} 
                            ann={ann} 
                            handleAnnouncementStatus={handleAnnouncementStatus}
                            handleEditClick={handleEditClick}
                            handleAnnouncementDelete={handleAnnouncementDelete}
                        />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Category Management */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '100px', zIndex: 1000 }}>
            
            {/* 1. Make New Announcement (Direct Publish for Super Admin) */}
            <div className="card shadow-lg border-0 rounded-3 mb-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3 text-primary">Quick Announcement</h4>
                <p className="small text-muted">Directly publish updates to all students.</p>
                <form onSubmit={handleAnnouncementSubmit}>
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="annTitle" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                    <label htmlFor="annTitle">Title</label>
                  </div>
                  <div className="form-floating mb-3">
                    <textarea className="form-control" id="annContent" placeholder="Content..." style={{ height: '100px' }} value={annContent} onChange={(e) => setAnnContent(e.target.value)} required></textarea>
                    <label htmlFor="annContent">Content</label>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={annLoading}>
                    {annLoading ? 'Publishing...' : 'Publish Now'}
                  </button>
                </form>
              </div>
            </div>

            {/* 2. Category Manager (Drag/Drop/Edit functionality ke liye) */}
            <div className="card shadow-lg border-0 rounded-3 mb-4">
              <CategoryManager isSelectOnly={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {isEditingAnn && currentAnn && (
        <EditAnnouncementModal
          item={currentAnn}
          onClose={() => setIsEditingAnn(false)}
          onUpdate={handleUpdateAnn}
        />
      )}
    </DashboardLayout>
  );
}
