import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';

export default function MyInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyInquiries = async () => {
            try {
                const { data } = await api.get('/contact/my-inquiries');
                setInquiries(data.inquiries);
            } catch (err) {
                console.error("Failed to fetch your inquiries:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyInquiries();
    }, []);

    if (loading) return <LoadingScreen text="Fetching your inquiries..." />;

    return (
        <DashboardLayout>
            <div className="container-fluid fade-in">
                <div className="mb-4">
                    <h3 className="fw-bold text-primary mb-1">My Contact Inquiries</h3>
                    <p className="text-muted small">Track the status of your messages sent to the GyanStack team.</p>
                </div>

                {inquiries.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <i className="bi bi-chat-dots display-1 text-muted opacity-25"></i>
                        <h4 className="mt-3 text-muted">You haven't sent any inquiries yet.</h4>
                        <a href="/contact" className="btn btn-primary mt-3">Send an Inquiry</a>
                    </div>
                ) : (
                    <div className="row g-3">
                        {inquiries.map((msg) => (
                            <div key={msg._id} className="col-12">
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <span className="text-muted small d-block mb-1">
                                                    <i className="bi bi-calendar-event me-2"></i>
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                                <h5 className="fw-bold mb-0">Message sent regarding support</h5>
                                            </div>
                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                msg.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' :
                                                msg.status === 'reviewed' ? 'bg-info bg-opacity-10 text-info' : 'bg-success bg-opacity-10 text-success'
                                            }`}>
                                                <i className={`bi ${
                                                    msg.status === 'pending' ? 'bi-clock-history' :
                                                    msg.status === 'reviewed' ? 'bi-eye-fill' : 'bi-check-circle-fill'
                                                } me-1`}></i>
                                                {msg.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="bg-light p-3 rounded-3 mb-0">
                                            <p className="mb-0 small text-dark lh-base" style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                        </div>
                                        {msg.status === 'resolved' && (
                                            <div className="mt-3 text-success small fw-bold">
                                                <i className="bi bi-patch-check-fill me-1"></i> This inquiry has been resolved. Check your email for details.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
