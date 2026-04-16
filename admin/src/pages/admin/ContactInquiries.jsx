import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  badgeCls: 'bg-warning bg-opacity-10 text-warning',  corner: '#ffc107' },
  reviewed: { label: 'Reviewed', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',   badgeCls: 'bg-info bg-opacity-10 text-info',         corner: '#0dcaf0' },
  resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  badgeCls: 'bg-success bg-opacity-10 text-success',   corner: '#198754' },
};

export default function ContactInquiries() {
    const [messages, setMessages]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState('all');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/contact');
            setMessages(data.messages || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            toast.error('Failed to load inquiries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/contact/${id}/status`, { status: newStatus });
            setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m));
            toast.success(`✅ Marked as "${newStatus}".`);
        } catch {
            toast.error('Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this inquiry permanently?')) return;
        try {
            await api.delete(`/contact/${id}`);
            setMessages(prev => prev.filter(m => m._id !== id));
            toast.success('🗑️ Inquiry deleted.');
        } catch {
            toast.error('Failed to delete inquiry.');
        }
    };

    const filteredMessages = messages.filter(msg =>
        filter === 'all' ? true : msg.status === filter
    );

    if (loading) return <LoadingScreen text="Fetching inquiries..." />;

    // ── Counts ────────────────────────────────────────────────────────────
    const pendingCount  = messages.filter(m => m.status === 'pending').length;
    const reviewedCount = messages.filter(m => m.status === 'reviewed').length;
    const resolvedCount = messages.filter(m => m.status === 'resolved').length;

    return (
        <div className="container-fluid py-2 px-2 px-md-3">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-envelope-paper text-primary me-2" />Contact Inquiries
                    </h4>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>Support &amp; general platform queries</small>
                </div>
                <button className="btn btn-outline-primary btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32 }} onClick={fetchMessages} title="Refresh">
                    <i className="bi bi-arrow-clockwise fs-5" />
                </button>
            </div>

            {/* ── Stats Strip ───────────────────────────────────────────── */}
            {messages.length > 0 && (
                <div className="d-flex gap-2 mb-3 flex-wrap px-1">
                    {[
                        { label: 'Total',    value: messages.length, color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.18)' },
                        { label: 'Pending',  value: pendingCount,    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)' },
                        { label: 'Reviewed', value: reviewedCount,   color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.18)'  },
                        { label: 'Resolved', value: resolvedCount,   color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
                    ].map(stat => (
                        <div key={stat.label} className="rounded-3 px-3 py-2 flex-fill text-center"
                            style={{ background: stat.bg, border: `1px solid ${stat.border}`, minWidth: '60px' }}>
                            <div className="fw-bold" style={{ fontSize: '1.05rem', color: stat.color }}>{stat.value}</div>
                            <div className="text-muted" style={{ fontSize: '0.63rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filter + Refresh ──────────────────────────────────────── */}
            <div className="d-flex gap-2 mb-3 px-1">
                {['all', 'pending', 'reviewed', 'resolved'].map(f => (
                    <button key={f}
                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === f ? 'btn-primary' : 'btn-outline-secondary border-0'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── Empty ─────────────────────────────────────────────────── */}
            {filteredMessages.length === 0 && (
                <div className="text-center py-5">
                    <i className="bi bi-envelope-open display-1 text-muted opacity-25" />
                    <h5 className="mt-3 fw-bold">No inquiries found.</h5>
                    <p className="text-muted small">Try changing the filter above.</p>
                </div>
            )}

            {/* ── Cards Grid ────────────────────────────────────────────── */}
            <div className="row gx-3 gy-3">
                {filteredMessages.map((msg) => {
                    const cfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.pending;
                    return (
                        <div key={msg._id} className="col-12 col-lg-6">
                            <div className="rounded-4 overflow-hidden h-100 position-relative"
                                style={{
                                    background: 'var(--glass-bg, #fff)',
                                    border: `1px solid var(--glass-border, #e5e7eb)`,
                                    borderLeft: `4px solid ${cfg.corner}`,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow 0.2s ease',
                                }}>
                                <div className="p-3 p-md-4">

                                    {/* Top: Avatar + Name + Time + Badge */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                                style={{ width: 42, height: 42, background: cfg.bg, color: cfg.color, fontSize: '1.1rem' }}>
                                                {msg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{msg.name}</h6>
                                                <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                                                    <i className="bi bi-clock me-1" />
                                                    {new Date(msg.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        </div>
                                        <span className={`badge rounded-pill px-3 py-2 fw-semibold ${cfg.badgeCls}`} style={{ fontSize: '0.65rem' }}>
                                            {msg.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        <a href={`mailto:${msg.email}`} className="d-flex align-items-center gap-1 text-decoration-none rounded-pill px-3 py-1"
                                            style={{ background: 'rgba(99,102,241,0.07)', color: '#6366f1', fontSize: '0.72rem', border: '1px solid rgba(99,102,241,0.15)' }}>
                                            <i className="bi bi-envelope-fill" />{msg.email}
                                        </a>
                                        {msg.phone && (
                                            <a href={`tel:${msg.phone}`} className="d-flex align-items-center gap-1 text-decoration-none rounded-pill px-3 py-1"
                                                style={{ background: 'rgba(16,185,129,0.07)', color: '#10b981', fontSize: '0.72rem', border: '1px solid rgba(16,185,129,0.15)' }}>
                                                <i className="bi bi-telephone-fill" />{msg.phone}
                                            </a>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="rounded-3 p-3 mb-3" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}>
                                        <p className="mb-0 small lh-base" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                                            {msg.message}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex justify-content-between align-items-center pt-2">
                                        <div className="d-flex gap-1 p-1 rounded-pill" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                            {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                                <button key={s}
                                                    onClick={() => handleUpdateStatus(msg._id, s)}
                                                    className={`btn btn-xs rounded-pill border-0 fw-semibold px-3 ${msg.status === s ? 'shadow-sm text-white' : 'btn-light bg-transparent text-muted'}`}
                                                    style={{ fontSize: '0.68rem', padding: '3px 8px', backgroundColor: msg.status === s ? c.corner : undefined }}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => handleDelete(msg._id)}
                                            className="btn btn-sm btn-outline-danger border-0 rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: 32, height: 32 }} title="Delete">
                                            <i className="bi bi-trash3-fill" style={{ fontSize: '0.75rem' }} />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
