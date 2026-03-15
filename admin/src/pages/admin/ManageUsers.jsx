import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
// -------------------

const UserCardMobile = ({ user, handleRoleChange, handleUserDelete }) => (
    <div className="card mb-3 border border-light rounded-3 transition-all">
        <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="data-item fw-bold text-dark" style={{ fontSize: '1rem' }}>{user.username}</div>
                <span className={`badge rounded-pill ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>{user.role}</span>
            </div>
            <div className="data-item small text-muted mb-3">{user.email}</div>
            
            <div className="d-flex gap-2 align-items-center">
                <div className="scroll-selection-container flex-grow-1">
                    <div className="d-flex gap-1 overflow-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        <button className={`btn btn-xs ${user.role === 'student' ? 'btn-success' : 'btn-outline-success'} border-0`} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleRoleChange(user._id, 'student')}>Student</button>
                        <button className={`btn btn-xs ${user.role === 'admin' ? 'btn-warning' : 'btn-outline-warning'} border-0`} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleRoleChange(user._id, 'admin')}>Admin</button>
                        <button className={`btn btn-xs ${user.role === 'superadmin' ? 'btn-danger' : 'btn-outline-danger'} border-0`} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleRoleChange(user._id, 'superadmin')} disabled={user.role === 'superadmin'}>Super</button>
                    </div>
                </div>
                <button 
                  className="btn btn-sm btn-outline-danger border-0 rounded-circle" 
                  style={{ width: '32px', height: '32px', padding: '0' }}
                  onClick={() => handleUserDelete(user._id)}
                  disabled={user.role === 'superadmin'}
                >
                  <i className="bi bi-trash3 fs-6"></i>
                </button>
            </div>
        </div>
    </div>
);

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to load users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      setSuccess(`Role changed to ${newRole} updated successfully.`);
    } catch (err) {
      setError("Failed to update user role.");
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY delete this user? All their uploaded content will also be removed.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers(); 
      setSuccess("User deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading) return <LoadingScreen text="Loading User Roles..." />;

  return (
    <div className="container-fluid fade-in px-0 overflow-hidden d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 pe-3">
        <h4 className="fw-bold text-danger mb-0">
            <i className="bi bi-people-fill me-2"></i>Manage User Roles
        </h4>
        <button className="btn btn-sm btn-outline-primary border-0 rounded-circle" style={{ width: '32px', height: '32px' }} onClick={fetchUsers} title="Refresh">
            <i className="bi bi-arrow-clockwise fs-5"></i>
        </button>
      </div>
      
      {error && <div className="alert alert-danger mx-2" onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success mx-2" onClick={() => setSuccess('')}>{success}</div>}

      <div className="card border-0 rounded-3 flex-grow-1 overflow-hidden d-flex flex-column mb-3">
        <div className="card-body p-0 d-flex flex-column overflow-hidden"> 
          {/* DESKTOP VIEW: Table */}
          <div className="table-responsive d-none d-lg-block flex-grow-1 overflow-auto">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="sticky-top bg-white z-1 shadow-sm">
                <tr>
                  <th className="ps-4">Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="ps-4 fw-medium text-dark">{user.username}</td>
                    <td>{user.email}</td>
                    <td><span className={`badge rounded-pill ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{user.role}</span></td>
                    <td className="pe-4">
                      <div className="d-flex gap-3 align-items-center">
                        <div className="scroll-selection d-flex gap-1 p-1 bg-light rounded-pill">
                          <button className={`btn btn-sm rounded-pill border-0 px-3 ${user.role === 'student' ? 'btn-success shadow-sm' : 'btn-light'}`} style={{ fontSize: '0.75rem' }} onClick={() => handleRoleChange(user._id, 'student')}>Student</button>
                          <button className={`btn btn-sm rounded-pill border-0 px-3 ${user.role === 'admin' ? 'btn-warning shadow-sm' : 'btn-light'}`} style={{ fontSize: '0.75rem' }} onClick={() => handleRoleChange(user._id, 'admin')}>Admin</button>
                          <button className={`btn btn-sm rounded-pill border-0 px-3 ${user.role === 'superadmin' ? 'btn-danger shadow-sm' : 'btn-light'}`} style={{ fontSize: '0.75rem' }} onClick={() => handleRoleChange(user._id, 'superadmin')} disabled={user.role === 'superadmin'}>Super</button>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle" 
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => handleUserDelete(user._id)}
                          disabled={user.role === 'superadmin'}
                          title="Delete User"
                        >
                          <i className="bi bi-trash3 fs-6"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* MOBILE VIEW: Cards */}
          <div className="d-lg-none p-3 overflow-auto flex-grow-1">
            {users.length === 0 ? (
                <div className="text-center py-5 text-muted">No users found.</div>
            ) : (
                users.map(user => (
                    <UserCardMobile key={user._id} user={user} handleRoleChange={handleRoleChange} handleUserDelete={handleUserDelete} />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
);
}
