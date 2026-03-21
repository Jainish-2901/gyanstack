import React from 'react';
import { Link } from 'react-router-dom';

const APP_NAME = 'GyanStack';
const DEVELOPER_NAME = 'Jainish Dabgar';

const FeatureBox = ({ icon, title, description, colorClass }) => (
    <div className="col-lg-3 col-md-6 mb-4">
        <div className="glass-panel h-100 p-4 rounded-4 border-0 shadow-sm transition-all hover-translate-y">
            <div className={`icon-wrapper ${colorClass} mb-3 shadow-sm`}
                style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                <i className={`bi ${icon} text-white fs-4`}></i>
            </div>
            <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h6>
            <p className="text-muted extra-small mb-0" style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>{description}</p>
        </div>
    </div>
);

export default function About() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* --- HERO SECTION --- */}
            <div className="py-5" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 100%)',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div className="container py-4 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-3 text-muted small">
                        <Link to="/" className="text-decoration-none text-muted">Home</Link>
                        <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
                        <span>About Us</span>
                    </div>
                    <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        One Platform. <span className="text-primary">Every Field.</span>
                    </h1>
                    <p className="text-muted mx-auto" style={{ maxWidth: '700px', fontSize: '1.05rem' }}>
                        {APP_NAME} is a cross-disciplinary digital library designed to empower students
                        from all academic backgrounds with high-quality, verified study materials.
                    </p>
                </div>
            </div>

            <div className="container py-5">
                {/* --- OUR MISSION SECTION --- */}
                <div className="row align-items-center mb-5 pb-lg-4">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <div className="pe-lg-5">
                            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Vision</h2>
                            <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                                Knowledge shouldn't be trapped in expensive books or messy folders.
                                Whether you are studying **Computer Applications, Commerce, Engineering, or Arts**,
                                {APP_NAME} provides a centralized hub to find everything you need to excel in your exams.
                            </p>

                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-3 glass-panel p-3 rounded-3 border-0">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 45, height: 45 }}>
                                            <i className="bi bi-stack text-primary"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">Multi-Stream Content</h6>
                                            <p className="extra-small text-muted mb-0">Resources for diverse academic disciplines.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-3 glass-panel p-3 rounded-3 border-0">
                                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 45, height: 45 }}>
                                            <i className="bi bi-people-fill text-success"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">Student-Led Growth</h6>
                                            <p className="extra-small text-muted mb-0">Content uploaded and verified by fellow toppers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="glass-panel p-2 rounded-5 shadow-lg overflow-hidden position-relative">
                            {/* Image with object-fit to ensure it fills the container nicely */}
                            <img
                                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80"
                                alt="Modern Education Library"
                                className="img-fluid rounded-4 w-100"
                                style={{ minHeight: '300px', objectFit: 'cover' }}
                            />

                            {/* Fixed Badge Container */}
                            <div className="position-absolute bottom-0 end-0 m-3 m-md-4 fade-in"
                                style={{ zIndex: 10 }}>
                                <div className="bg-primary text-white p-3 rounded-4 shadow-lg border border-white border-opacity-25"
                                    style={{ backdropFilter: 'blur(10px)', minWidth: '140px' }}>
                                    <h4 className="mb-0 fw-bold">Free Access</h4>
                                    <small className="opacity-75">Zero Hidden Costs</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- WHAT WE OFFER (Universal Features) --- */}
                <div className="row mb-5 text-center mt-5">
                    <div className="col-12 mb-5">
                        <h6 className="text-primary fw-bold text-uppercase tracking-wider">Features Recap</h6>
                        <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Why Join {APP_NAME}?</h2>
                    </div>
                    <FeatureBox
                        icon="bi-lightning-charge-fill"
                        title="Exam Time Saver"
                        description="Access 'IMP' tagged resources for any subject to maximize your revision time."
                        colorClass="bg-gradient-1"
                    />
                    <FeatureBox
                        icon="bi-robot"
                        title="Smart Learning"
                        description="Use AI-driven suggestions to find relevant documents tailored to your field."
                        colorClass="bg-gradient-3"
                    />
                    <FeatureBox
                        icon="bi-shield-check"
                        title="Syllabus Focused"
                        description="Every document is curated to match specific university and college syllabi."
                        colorClass="bg-gradient-4"
                    />
                    <FeatureBox
                        icon="bi-megaphone-fill"
                        title="Ad-Free Study"
                        description="An uninterrupted environment designed specifically for deep focus and learning."
                        colorClass="bg-gradient-2"
                    />
                </div>

                {/* --- DEVELOPER PROFILE --- */}
                <div className="row justify-content-center mt-5">
                    <div className="col-lg-10">
                        <div className="glass-panel rounded-5 p-4 p-md-5 border-primary border-opacity-10 shadow-sm overflow-hidden position-relative">
                            {/* Decorative Glow background */}
                            <div className="position-absolute top-0 end-0 bg-primary bg-opacity-10 rounded-circle"
                                style={{ width: '200px', height: '200px', filter: 'blur(60px)', marginRight: '-100px' }}></div>

                            <div className="row align-items-center position-relative">
                                <div className="col-md-3 text-center mb-4 mb-md-0">
                                    <div className="avatar-container position-relative d-inline-block">
                                        {/* GITHUB PROFILE IMAGE FETCH */}
                                        <div className="rounded-circle overflow-hidden border border-4 border-white shadow-lg bg-light"
                                            style={{ width: '140px', height: '140px' }}>
                                            <img
                                                src="https://github.com/Jainish-2901.png"
                                                alt={DEVELOPER_NAME}
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    // Fallback if GitHub image fails to load
                                                    e.target.src = "https://ui-avatars.com/api/?name=Jainish+Dabgar&background=6366f1&color=fff";
                                                }}
                                            />
                                        </div>
                                        {/* Animated Online Status Dot */}
                                        <div className="position-absolute bottom-0 end-0 bg-success border border-white border-3 rounded-circle"
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                boxShadow: '0 0 15px rgba(25, 135, 84, 0.5)',
                                                animation: 'pulse-green 2s infinite'
                                            }}
                                            title="Available for projects">
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-9 text-center text-md-start ps-md-4">
                                    <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{DEVELOPER_NAME}</h4>
                                    <p className="text-primary small fw-bold mb-3">Founder & Full-Stack Developer</p>
                                    <p className="text-muted mb-4" style={{ fontSize: '0.97rem', lineHeight: '1.7' }}>
                                        I created **{APP_NAME}** with a vision to build a borderless knowledge hub.
                                        What started as a tool for my peers has grown into a platform serving students
                                        across all academic departments. I am passionate about leveraging modern
                                        web technologies to solve real-world educational challenges.
                                    </p>
                                    <div className="d-flex justify-content-center justify-content-md-start gap-3">
                                        <a href="https://github.com/Jainish-2901" target="_blank" rel="noreferrer" className="btn btn-dark btn-sm rounded-pill px-4 shadow-sm py-2">
                                            <i className="bi bi-github me-2"></i>GitHub Profile
                                        </a>
                                        <Link to="/contact" className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm py-2">
                                            <i className="bi bi-chat-dots-fill me-2"></i>Let's Connect
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CSS for the Online Status Animation */}
                <style>{`
                    @keyframes pulse-green {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
                    }
                    `}</style>
            </div>
        </div>
    );
}