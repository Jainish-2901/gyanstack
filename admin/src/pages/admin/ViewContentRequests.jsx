import React from 'react';
import { useContentRequests, useRequestMutation } from '../../hooks/useAdminRequests';
import LoadingScreen from '../../components/LoadingScreen';

const StatusBadge = ({ status }) => (
    <span className={`badge rounded-pill px-3 py-1 fw-semibold ${
        status === 'fulfilled'
            ? 'text-success'
            : 'text-warning'
    }`} style={{
        background: status === 'fulfilled' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        fontSize: '0.68rem',
        letterSpacing: '0.03em'
    }}>
        {status === 'fulfilled' ? '✅ Fulfilled' : '⏳ Pending'}
    </span>
);

const RequestCardMobile = ({ req, handleUpdateStatus, handleDelete, isStatusPending, isDeletePending }) => (
    <div className="mb-3 rounded-4 overflow-hidden" style={{
        background: 'var(--glass-bg, #fff)',
        border: '1px solid var(--glass-border, #e5e7eb)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${req.status === 'fulfilled' ? '#10b981' : '#f59e0b'}`,
    }}>
        {/* Top Row: User + Status */}
        <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
            <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 34, height: 34, background: 'rgba(99,102,241,0.1)' }}>
                    <i className="bi bi-person-fill text-primary" style={{ fontSize: '0.9rem' }} />
                </div>
                <div>
                    <div className="fw-bold" style={{ fontSize: '0.82rem', color: 'var(--text-primary, #1f2937)', lineHeight: 1.2 }}>
                        {req.requestedBy?.username || 'Unknown'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                        {req.requestedBy?.email}
                    </div>
                </div>
            </div>
            <StatusBadge status={req.status} />
        </div>

        {/* Topic + Message */}
        <div className="px-3 pb-2">
            <div className="rounded-3 p-2 px-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.08)' }}>
                <div className="fw-bold mb-1" style={{ fontSize: '0.84rem', color: 'var(--text-primary, #1f2937)' }}>
                    <i className="bi bi-bookmark-fill text-primary me-1" style={{ fontSize: '0.7rem' }} />
                    {req.topic}
                </div>
                <div className="text-muted" style={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
                    {req.message || <span className="fst-italic opacity-50">No message provided.</span>}
                </div>
            </div>
        </div>

        {/* Bottom Row: Date + Actions */}
        <div className="d-flex justify-content-between align-items-center px-3 pb-3">
            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.67rem' }}>
                <i className="bi bi-clock" />
                <span>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="d-flex gap-2">
                <button
                    onClick={() => handleUpdateStatus(req._id, req.status === 'pending' ? 'fulfilled' : 'pending')}
                    disabled={isStatusPending || isDeletePending}
                    className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                        req.status === 'pending' ? 'btn-primary' : 'btn-outline-warning'
                    }`}
                    style={{ fontSize: '0.72rem', minWidth: '72px' }}
                >
                    {isStatusPending
                        ? <span className="spinner-border spinner-border-sm" role="status" />
                        : req.status === 'pending' ? 'Fulfill' : 'Reopen'
                    }
                </button>
                <button
                    onClick={() => handleDelete(req._id)}
                    disabled={isStatusPending || isDeletePending}
                    className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, padding: 0 }}
                    title="Delete"
                >
                    {isDeletePending
                        ? <span className="spinner-border spinner-border-sm text-danger" role="status" />
                        : <i className="bi bi-trash3-fill" style={{ fontSize: '0.75rem' }} />
                    }
                </button>
            </div>
        </div>
    </div>
);

export default function ViewContentRequests() {
    const { data: requests = [], isLoading: loading, error: fetchError, refetch: refreshRequests } = useContentRequests();
    const { updateStatus: mutateStatus, deleteRequest: mutateDelete } = useRequestMutation();

    const handleUpdateStatus = (id, newStatus) => {
        mutateStatus.mutate({ id, status: newStatus });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this request?')) return;
        mutateDelete.mutate(id);
    };

    const isStatusPending = mutateStatus.isPending;
    const isDeletePending = mutateDelete.isPending;

    if (loading) return <LoadingScreen text="Fetching user requests..." />;

    // ── Summary counts ──────────────────────────────────────────────────────
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length;

    return (
        <div className="container-fluid fade-in px-1 px-md-3" style={{ overflowX: 'hidden' }}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-chat-left-text text-primary me-2" />Content Requests
                    </h4>
                    <p className="text-muted small mb-0 d-none d-md-block">Manage and fulfill user requested topics</p>
                </div>
                <button
                    onClick={() => refreshRequests()}
                    className="btn btn-outline-primary btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }}
                    title="Refresh"
                >
                    <i className="bi bi-arrow-clockwise fs-5" />
                </button>
            </div>

            {/* ── Mobile Summary Pills ────────────────────────────────────── */}
            {requests.length > 0 && (
                <div className="d-flex gap-2 mb-3 px-1">
                    <div className="rounded-3 px-3 py-2 flex-fill text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div className="fw-bold text-warning" style={{ fontSize: '1.1rem' }}>{pendingCount}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>Pending</div>
                    </div>
                    <div className="rounded-3 px-3 py-2 flex-fill text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{fulfilledCount}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>Fulfilled</div>
                    </div>
                    <div className="rounded-3 px-3 py-2 flex-fill text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{requests.length}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>Total</div>
                    </div>
                </div>
            )}

            {/* ── Error ──────────────────────────────────────────────────── */}
            {fetchError && (
                <div className="alert alert-danger border-0 rounded-4 d-flex align-items-center mx-1">
                    <i className="bi bi-exclamation-octagon-fill me-2" />
                    <div className="small">Failed to load content requests. Please refresh.</div>
                </div>
            )}

            {/* ── Empty State ─────────────────────────────────────────────── */}
            {!loading && requests.length === 0 && (
                <div className="p-5 text-center mt-4 border-0 glass-card mx-1">
                    <i className="bi bi-chat-dots display-1 text-primary opacity-25 mb-4 d-block" />
                    <h5 className="fw-bold">No Requests Found</h5>
                    <p className="text-muted small">Users haven't requested any specific content yet.</p>
                </div>
            )}

            {/* ── Content ─────────────────────────────────────────────────── */}
            {requests.length > 0 && (
                <div className="p-0 border-0 overflow-hidden rounded-4">

                    {/* DESKTOP: Table */}
                    <div className="table-responsive d-none d-lg-block glass-card border-0 shadow-none">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4 py-3 border-0 text-muted small fw-bold text-uppercase">Requested By</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Topic</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Message</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Status</th>
                                    <th className="pe-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req._id} className="transition-all">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{ width: 40, height: 40 }}>
                                                    <i className="bi bi-person-fill fs-5" />
                                                </div>
                                                <div>
                                                    <p className="mb-0 fw-bold">{req.requestedBy?.username || 'Unknown User'}</p>
                                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{req.requestedBy?.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{req.topic}</span>
                                            <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </small>
                                        </td>
                                        <td className="py-3">
                                            <p className="mb-0 small text-muted" style={{ maxWidth: 300, whiteSpace: 'normal' }}>
                                                {req.message || <span className="fst-italic opacity-50">No message provided.</span>}
                                            </p>
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    onClick={() => handleUpdateStatus(req._id, req.status === 'pending' ? 'fulfilled' : 'pending')}
                                                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${req.status === 'pending' ? 'btn-primary' : 'btn-outline-warning'}`}
                                                    disabled={isStatusPending || isDeletePending}
                                                >
                                                    {isStatusPending
                                                        ? <span className="spinner-border spinner-border-sm" role="status" />
                                                        : req.status === 'pending' ? 'Mark Fulfilled' : 'Reopen'
                                                    }
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(req._id)}
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                                                    title="Delete Request"
                                                    disabled={isStatusPending || isDeletePending}
                                                >
                                                    {isDeletePending
                                                        ? <span className="spinner-border spinner-border-sm text-danger" role="status" />
                                                        : <i className="bi bi-trash3-fill" />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE: Cards */}
                    <div className="d-lg-none px-1 pb-4">
                        {requests.map((req) => (
                            <RequestCardMobile
                                key={req._id}
                                req={req}
                                handleUpdateStatus={handleUpdateStatus}
                                handleDelete={handleDelete}
                                isStatusPending={isStatusPending}
                                isDeletePending={isDeletePending}
                            />
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
}
