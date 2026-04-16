import React, { useState } from 'react';
import { useAllUsers, useAdminUserMutation } from '../../hooks/useAdminUsers';
import LoadingScreen from '../../components/LoadingScreen';

const ROLE_CONFIG = {
  student:    { label: 'Student',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  badge: 'bg-success'  },
  admin:      { label: 'Admin',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  badge: 'bg-warning text-dark' },
  superadmin: { label: 'Super',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   badge: 'bg-danger'   },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.student;
  return (
    <span className={`badge rounded-pill px-2 py-1 fw-semibold ${cfg.badge}`} style={{ fontSize: '0.62rem' }}>
      {cfg.label.toUpperCase()}
    </span>
  );
};

const UserCardMobile = ({ user, handleRoleChange, handleToggleActive, isRolePending, isDeactivatePending }) => (
  <div className="mb-3 rounded-4 overflow-hidden" style={{
    background: 'var(--glass-bg, #fff)',
    border: `1px solid ${user.isDeleted ? 'rgba(239,68,68,0.25)' : 'var(--glass-border, #e5e7eb)'}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${user.isDeleted ? '#ef4444' : ROLE_CONFIG[user.role]?.color || '#6366f1'}`,
    opacity: user.isDeleted ? 0.75 : 1,
  }}>
    {/* Top: Avatar + Name + Role */}
    <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
      <div className="d-flex align-items-center gap-2">
        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
          style={{ width: 36, height: 36, background: ROLE_CONFIG[user.role]?.bg || 'rgba(99,102,241,0.1)', color: ROLE_CONFIG[user.role]?.color || '#6366f1', fontSize: '0.95rem' }}>
          {(user.username || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.84rem', color: 'var(--text-primary, #1f2937)', textDecoration: user.isDeleted ? 'line-through' : 'none' }}>
            {user.username}
            {user.isDeleted && <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '0.55rem' }}>Deactivated</span>}
          </div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>{user.email}</div>
        </div>
      </div>
      <RoleBadge role={user.role} />
    </div>

    {/* Info Row */}
    <div className="px-3 pb-2">
      <div className="rounded-3 px-3 py-2 d-flex gap-3 flex-wrap" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}>
        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.7rem' }}>
          {user.googleId
            ? <><i className="bi bi-google text-danger" /><span>Google</span></>
            : <><i className="bi bi-person-badge text-primary" /><span>Manual</span></>
          }
        </div>
        {user.phone && (
          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.7rem' }}>
            <i className="bi bi-telephone text-primary" />
            <span>{user.phone}</span>
          </div>
        )}
      </div>
    </div>

    {/* Role Switcher */}
    {!user.isDeleted && (
      <div className="px-3 pb-2">
        <div className="d-flex gap-1 p-1 rounded-pill" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <button key={role}
              className={`btn btn-xs flex-fill rounded-pill border-0 fw-semibold ${user.role === role ? cfg.badge + ' shadow-sm' : 'btn-light bg-transparent'}`}
              style={{ fontSize: '0.65rem', padding: '3px 0' }}
              onClick={() => handleRoleChange(user._id, role)}
              disabled={isRolePending || user.role === 'superadmin'}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Bottom Actions */}
    <div className="d-flex justify-content-end px-3 pb-3 gap-2">
      {user.role !== 'superadmin' && (
        <button
          onClick={() => handleToggleActive(user._id, user.isDeleted)}
          disabled={isDeactivatePending}
          className={`btn btn-sm rounded-pill px-3 fw-semibold ${user.isDeleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
          style={{ fontSize: '0.72rem' }}
        >
          {isDeactivatePending
            ? <span className="spinner-border spinner-border-sm" role="status" />
            : user.isDeleted
              ? <><i className="bi bi-unlock me-1" />Reactivate</>
              : <><i className="bi bi-lock me-1" />Deactivate</>
          }
        </button>
      )}
    </div>
  </div>
);

export default function ManageUsers() {
  const { data: users = [], isLoading: loading, refetch: refreshUsers } = useAllUsers();
  const { changeRole, deactivateUser, reactivateUser } = useAdminUserMutation();

  const handleRoleChange = (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    changeRole.mutate({ userId, role: newRole });
  };

  const handleToggleActive = (userId, isCurrentlyDeactivated) => {
    if (isCurrentlyDeactivated) {
      if (!window.confirm('Reactivate this user? They will be able to log in again.')) return;
      reactivateUser.mutate(userId);
    } else {
      if (!window.confirm('Deactivate this user? Their content stays safe but they cannot log in.')) return;
      deactivateUser.mutate(userId);
    }
  };

  if (loading) return <LoadingScreen text="Loading User Roles..." />;

  // ── Counts ───────────────────────────────────────────────────────────────
  const totalUsers   = users.length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const superCount   = users.filter(u => u.role === 'superadmin').length;
  const deactivated  = users.filter(u => u.isDeleted).length;

  const isRolePending       = changeRole.isPending;
  const isDeactivatePending = deactivateUser.isPending || reactivateUser.isPending;

  return (
    <div className="container-fluid fade-in px-0 overflow-hidden d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0 pe-3">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          <i className="bi bi-person-gear text-primary me-2" />User Access Control
        </h4>
        <button className="btn btn-sm btn-outline-primary border-0 rounded-circle"
          style={{ width: 32, height: 32 }} onClick={() => refreshUsers()} title="Refresh">
          <i className="bi bi-arrow-clockwise fs-5" />
        </button>
      </div>

      {/* ── Stats Strip ─────────────────────────────────────────────────────── */}
      {users.length > 0 && (
        <div className="d-flex gap-2 mb-3 flex-wrap px-1 flex-shrink-0">
          {[
            { label: 'Total',       value: totalUsers,   color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.18)' },
            { label: 'Students',    value: studentCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
            { label: 'Admins',      value: adminCount,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)' },
            { label: 'Super',       value: superCount,   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)'  },
            { label: 'Deactivated', value: deactivated,  color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)'},
          ].map(stat => (
            <div key={stat.label} className="rounded-3 px-3 py-2 flex-fill text-center"
              style={{ background: stat.bg, border: `1px solid ${stat.border}`, minWidth: '58px' }}>
              <div className="fw-bold" style={{ fontSize: '1.05rem', color: stat.color }}>{stat.value}</div>
              <div className="text-muted" style={{ fontSize: '0.63rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card border-0 rounded-3 flex-grow-1 overflow-hidden d-flex flex-column mb-3">
        <div className="card-body p-0 d-flex flex-column overflow-hidden">

          {/* ── DESKTOP: Table ─────────────────────────────────────────────── */}
          <div className="table-responsive d-none d-lg-block flex-grow-1 overflow-auto">
            <table className="table table-hover align-middle mb-0 border-0">
              <thead className="sticky-top z-1 shadow-sm">
                <tr>
                  <th className="ps-4">Method</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ opacity: user.isDeleted ? 0.6 : 1 }}>
                    <td className="ps-4">
                      {user.googleId ? (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-google" /> Google
                        </span>
                      ) : (
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-person-badge" /> Manual
                        </span>
                      )}
                    </td>
                    <td className="fw-medium">
                      <span style={{ color: user.isDeleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: user.isDeleted ? 'line-through' : 'none' }}>
                        {user.username}
                      </span>
                      {user.isDeleted && <span className="badge bg-danger bg-opacity-10 text-danger ms-2" style={{ fontSize: '0.65rem' }}>Deactivated</span>}
                    </td>
                    <td className="text-secondary">{user.email}</td>
                    <td className="small text-secondary">{user.phone || <span className="text-muted opacity-50">N/A</span>}</td>
                    <td><RoleBadge role={user.role} /></td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 ${user.isDeleted ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`} style={{ fontSize: '0.65rem' }}>
                        {user.isDeleted ? '🔒 Inactive' : '✅ Active'}
                      </span>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex gap-2 align-items-center">
                        {!user.isDeleted && (
                          <div className="d-flex gap-1 p-1 bg-primary bg-opacity-5 rounded-pill border border-opacity-10">
                            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                              <button key={role}
                                className={`btn btn-xs rounded-pill border-0 px-3 ${user.role === role ? cfg.badge + ' shadow-sm' : 'btn-light bg-transparent'}`}
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleRoleChange(user._id, role)}
                                disabled={isRolePending || user.role === 'superadmin'}
                              >
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleToggleActive(user._id, user.isDeleted)}
                            disabled={isDeactivatePending}
                            className={`btn btn-sm rounded-pill border-0 px-3 fw-semibold ${user.isDeleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
                            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            title={user.isDeleted ? 'Reactivate account' : 'Deactivate account'}
                          >
                            {user.isDeleted
                              ? <><i className="bi bi-unlock me-1" />Reactivate</>
                              : <><i className="bi bi-lock me-1" />Deactivate</>
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE: Cards ───────────────────────────────────────────────── */}
          <div className="d-lg-none p-2 overflow-auto flex-grow-1">
            {users.length === 0 ? (
              <div className="text-center py-5 text-muted">No users found.</div>
            ) : (
              users.map(user => (
                <UserCardMobile
                  key={user._id}
                  user={user}
                  handleRoleChange={handleRoleChange}
                  handleToggleActive={handleToggleActive}
                  isRolePending={isRolePending}
                  isDeactivatePending={isDeactivatePending}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
