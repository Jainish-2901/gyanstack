import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';

export default function ContactInquiries() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchMessages = async () => {
        try {
            const { data } = await api.get('/contact');
            setMessages(data.messages);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/contact/${id}/status`, { status: newStatus });
            fetchMessages(); // Refresh
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            await api.delete(`/contact/${id}`);
            fetchMessages();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const filteredMessages = messages.filter(msg => 
        filter === 'all' ? true : msg.status === filter
    );

    if (loading) return <LoadingScreen text="Fetching inquiries..." />;

    return (
        <DashboardLayout>
            <div className="container-fluid fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold text-primary mb-1">Contact Inquiries</h3>
                        <p className="text-muted small">Manage and respond to user messages from the "Get into touch" page.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <select 
                            className="form-select shadow-sm" 
                            style={{ width: '150px' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <button className="btn btn-primary shadow-sm" onClick={fetchMessages}>
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredMessages.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-envelope-open display-1 text-muted opacity-25"></i>
                            <h4 className="mt-3 text-muted">No inquiries found.</h4>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div key={msg._id} className="col-lg-6">
                                <div className="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden inquiry-card">
                                    <div className={`status-indicator ${msg.status}`}></div>
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-circle-sm bg-primary bg-opacity-10 text-primary fw-bold">
                                                    {msg.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-0">{msg.name}</h5>
                                                    <small className="text-muted">{new Date(msg.createdAt).toLocaleString()}</small>
                                                </div>
                                            </div>
                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                msg.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' :
                                                msg.status === 'reviewed' ? 'bg-info bg-opacity-10 text-info' : 'bg-success bg-opacity-10 text-success'
                                            }`}>
                                                {msg.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="contact-info-grid mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-envelope text-primary me-2"></i>
                                                <a href={`mailto:${msg.email}`} className="text-decoration-none small text-dark fw-medium">{msg.email}</a>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-telephone text-primary me-2"></i>
                                                <a href={`tel:${msg.phone}`} className="text-decoration-none small text-dark fw-medium">{msg.phone}</a>
                                            </div>
                                        </div>

                                        <div className="bg-light p-3 rounded-3 mb-4">
                                            <p className="mb-0 small text-dark lh-base" style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                            <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                                <button 
                                                    className={`btn btn-sm ${msg.status === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                    onClick={() => handleUpdateStatus(msg._id, 'pending')}
                                                >Pending</button>
                                                <button 
                                                    className={`btn btn-sm ${msg.status === 'reviewed' ? 'btn-info' : 'btn-outline-info'}`}
                                                    onClick={() => handleUpdateStatus(msg._id, 'reviewed')}
                                                >Review</button>
                                                <button 
                                                    className={`btn btn-sm ${msg.status === 'resolved' ? 'btn-success' : 'btn-outline-success'}`}
                                                    onClick={() => handleUpdateStatus(msg._id, 'resolved')}
                                                >Resolved</button>
                                            </div>
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(msg._id)}>
                                                <i className="bi bi-trash3-fill"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <style>{`
                .status-indicator {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50px;
                    height: 50px;
                    background: transparent;
                    border-style: solid;
                    border-width: 0 50px 50px 0;
                }
                .status-indicator.pending { border-color: transparent #ffc107 transparent transparent; }
                .status-indicator.reviewed { border-color: transparent #0dcaf0 transparent transparent; }
                .status-indicator.resolved { border-color: transparent #198754 transparent transparent; }
                
                .avatar-circle-sm {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .inquiry-card {
                    transition: all 0.3s ease;
                }
                .inquiry-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </DashboardLayout>
    );
}
