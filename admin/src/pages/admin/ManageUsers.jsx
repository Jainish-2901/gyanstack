import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
// -------------------

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
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-danger mb-0">Manage User Roles</h3>
        <button className="btn btn-sm btn-outline-primary" onClick={fetchUsers}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>
      
      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-body p-0 responsive-card-view"> 
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
                          className="btn btn-sm btn-danger px-2" 
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
          
          <div className="d-lg-none p-3">
            {users.map(user => (
                <UserCardMobile key={user._id} user={user} handleRoleChange={handleRoleChange} handleUserDelete={handleUserDelete} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
