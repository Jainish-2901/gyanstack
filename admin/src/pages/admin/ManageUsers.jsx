import React, { useState } from 'react';
import { useAllUsers, useAdminUserMutation } from '../../hooks/useAdminUsers';
import LoadingScreen from '../../components/LoadingScreen';

// 🚀 HELPER: Mobile User Card
const UserCardMobile = ({ user, handleRoleChange, handleUserDelete }) => (
  <div className="card mb-3 border-0 rounded-4 shadow-sm overflow-hidden bg-white">
    <div className="card-body p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-person-fill"></i>
          </div>
          <div>
            <div className={`fw-bold small ${user.isDeleted ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>{user.username}</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>{user.email}</div>
          </div>
        </div>
        <span className={`badge rounded-pill ${user.role === 'superadmin' ? 'bg-danger' : user.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.6rem' }}>{user.role.toUpperCase()}</span>
      </div>
      
      <div className="bg-light p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center">
        <span className="small text-muted">Auth:</span>
        {user.googleId ? (
          <span className="badge bg-white text-danger border border-danger border-opacity-25 rounded-pill small"><i className="bi bi-google me-1"></i> Google</span>
        ) : (
          <span className="badge bg-white text-primary border border-primary border-opacity-25 rounded-pill small"><i className="bi bi-person-badge me-1"></i> Manual</span>
        )}
      </div>

      <div className="d-flex gap-2">
        <div className="dropdown flex-grow-1">
          <button className="btn btn-sm btn-outline-primary w-100 rounded-pill dropdown-toggle" type="button" data-bs-toggle="dropdown" disabled={user.role === 'superadmin'}>
            Change Role
          </button>
          <ul className="dropdown-menu shadow border-0 rounded-3">
            <li><button className="dropdown-item small" onClick={() => handleRoleChange(user._id, 'student')}>Make Student</button></li>
            <li><button className="dropdown-item small" onClick={() => handleRoleChange(user._id, 'admin')}>Make Admin</button></li>
          </ul>
        </div>
        <button 
          className="btn btn-sm btn-outline-danger rounded-pill px-3" 
          onClick={() => handleUserDelete(user._id)}
          disabled={user.role === 'superadmin'}
        >
          <i className="bi bi-trash3"></i>
        </button>
      </div>
    </div>
  </div>
);

export default function ManageUsers() {
  const { data: users = [], isLoading: loading, refetch: refreshUsers } = useAllUsers();
  const { changeRole, deactivateUser } = useAdminUserMutation();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    changeRole.mutate({ userId, role: newRole }, {
      onSuccess: () => setSuccess(`Role changed to ${newRole} updated successfully.`),
      onError: () => setError("Failed to update user role."),
    });
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? Their account will be blocked, but their UPLOADED CONTENT and names will remain safe in the library.')) return;
    deactivateUser.mutate(userId, {
      onSuccess: () => setSuccess("User deactivated successfully."),
      onError: (err) => setError(err.response?.data?.message || "Failed to deactivate user."),
    });
  };

  if (loading) return <LoadingScreen text="Loading User Roles..." />;

  return (
    <div className="container-fluid fade-in px-0 overflow-hidden d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 pe-3">
        <h4 className="fw-bold text-danger mb-0">
            <i className="bi bi-people-fill me-2"></i>Manage User Roles
        </h4>
        <button className="btn btn-sm btn-outline-primary border-0 rounded-circle" style={{ width: '32px', height: '32px' }} onClick={() => refreshUsers()} title="Refresh">
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
                  <th className="ps-4">Method</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="ps-4">
                        {user.googleId ? (
                            <span className="badge bg-light text-danger border border-danger border-opacity-25 rounded-pill d-inline-flex align-items-center gap-1">
                                <i className="bi bi-google"></i> Google
                            </span>
                        ) : (
                            <span className="badge bg-light text-primary border border-primary border-opacity-25 rounded-pill d-inline-flex align-items-center gap-1">
                                <i className="bi bi-person-badge"></i> Manual
                            </span>
                        )}
                    </td>
                    <td className="fw-medium text-dark">
                        <span className={user.isDeleted ? 'text-decoration-line-through text-muted' : ''}>{user.username}</span>
                        {user.isDeleted && <span className="badge bg-danger bg-opacity-10 text-danger ms-2" style={{ fontSize: '0.65rem' }}>Deactivated</span>}
                    </td>
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
