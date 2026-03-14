import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Contact() {
    const { user } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Auto-fill logic when user logs in or changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.username || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/contact', {
                ...formData,
                userId: user?.id
            });
            setSuccess(response.data.message);
            setFormData(prev => ({ ...prev, message: '' })); // Only clear message
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="glass-panel overflow-hidden border-0 shadow-lg rounded-4">
                        <div className="row g-0">
                            {/* Left Side: Illustration / Branding */}
                            <div className="col-md-5 bg-primary d-flex flex-column justify-content-center p-5 text-white">
                                <div className="mb-4">
                                    <i className="bi bi-chat-heart display-1"></i>
                                </div>
                                <h2 className="fw-bold mb-3">Get in Touch</h2>
                                <p className="lead opacity-75 mb-4">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

                                <div className="mt-auto">
                                    <a href="https://www.google.com/maps/search/Ahmedabad,+Gujarat,+India" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center mb-3 text-white text-decoration-none contact-info-link">
                                        <i className="bi bi-geo-alt-fill me-3 fs-4"></i>
                                        <span>Ahmedabad, Gujarat, India</span>
                                    </a>
                                    <a href="mailto:jainishdabgar2901@gmail.com" className="d-flex align-items-center mb-3 text-white text-decoration-none contact-info-link">
                                        <i className="bi bi-envelope-check-fill me-3 fs-4"></i>
                                        <span>jainishdabgar2901@gmail.com</span>
                                    </a>
                                    <a href="tel:+919773272749" className="d-flex align-items-center text-white text-decoration-none contact-info-link">
                                        <i className="bi bi-telephone-inbound-fill me-3 fs-4"></i>
                                        <span>+91 97732 72749</span>
                                    </a>
                                </div>

                                <style>{`
                                    .contact-info-link {
                                        transition: all 0.2s ease;
                                        opacity: 0.85;
                                    }
                                    .contact-info-link:hover {
                                        opacity: 1;
                                        transform: translateX(5px);
                                    }
                                `}</style>
                            </div>

                            {/* Right Side: Form */}
                            <div className="col-md-7 p-4 p-md-5 bg-white bg-opacity-75">
                                {success && (
                                    <div className="alert alert-success border-0 shadow-sm mb-4 d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                                        {success}
                                    </div>
                                )}
                                {error && (
                                    <div className="alert alert-danger border-0 shadow-sm mb-4 d-flex align-items-center">
                                        <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="name"
                                                    placeholder="Full Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <label htmlFor="name"><i className="bi bi-person me-2"></i>Full Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <label htmlFor="email"><i className="bi bi-envelope me-2"></i>Email ID</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    id="phone"
                                                    placeholder="Phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <label htmlFor="phone"><i className="bi bi-phone me-2"></i>Phone Number</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-4">
                                                <textarea
                                                    className="form-control"
                                                    placeholder="Message"
                                                    id="message"
                                                    style={{ height: '150px' }}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                                <label htmlFor="message"><i className="bi bi-pencil-square me-2"></i>What's on your mind?</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow-md"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                                                ) : (
                                                    <><i className="bi bi-send-fill me-2"></i>Send Message</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
