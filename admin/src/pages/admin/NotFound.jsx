import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container d-flex align-items-center justify-content-center min-vh-100 py-5">
            <style dangerouslySetInnerHTML={{ __html: `
                .not-found-container {
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent),
                                radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.05), transparent);
                }
                .error-code {
                    font-size: clamp(8rem, 20vw, 15rem);
                    font-weight: 900;
                    line-height: 1;
                    background: linear-gradient(135deg, var(--primary), var(--secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0;
                    filter: drop-shadow(0 10px 20px rgba(99, 102, 241, 0.1));
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .error-code:hover {
                    transform: scale(1.05) rotate(-2deg);
                }
                .error-illustration {
                    position: relative;
                    margin-bottom: -2rem;
                }
                .glow-orb {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    background: var(--primary);
                    filter: blur(80px);
                    opacity: 0.15;
                    border-radius: 50%;
                    z-index: -1;
                    animation: moveOrb 10s infinite alternate;
                }
                @keyframes moveOrb {
                    0% { transform: translate(-20%, -20%); }
                    100% { transform: translate(50%, 40%); }
                }
                .not-found-content {
                    max-width: 600px;
                    text-align: center;
                    padding: 2rem;
                    z-index: 1;
                }
                .interactive-box {
                    transition: all 0.3s ease;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                [data-bs-theme="dark"] .interactive-box {
                    border-color: rgba(255,255,255,0.05);
                }
                .interactive-box:hover {
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(10px);
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.05);
                }
                [data-bs-theme="dark"] .interactive-box:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}} />

            <div className="not-found-content fade-in">
                <div className="error-illustration">
                    <div className="glow-orb"></div>
                    <h1 className="error-code">404</h1>
                </div>
                
                <h2 className="fw-bold mb-3 fs-1 mt-0">Admin Access Error</h2>
                <p className="text-muted lead mb-5 px-4">
                    The administrative page or specific resource you are trying to access doesn't exist or has been moved. 
                    Let's get you back to the Control Center.
                </p>

                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-md-10">
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="btn btn-outline-primary px-4 py-3 rounded-pill d-flex align-items-center"
                            >
                                <i className="bi bi-arrow-left me-2"></i> Previous Page
                            </button>
                            <Link 
                                to="/" 
                                className="btn btn-primary px-5 py-3 rounded-pill cta-gradient shadow-lg d-flex align-items-center"
                            >
                                <i className="bi bi-speedometer2 me-2"></i> Dashboard Home
                            </Link>
                        </div>
                    </div>

                    <div className="col-12 mt-5">
                        <div className="row g-3">
                            <div className="col-6 col-md-4">
                                <Link to="/admin/content" className="text-decoration-none">
                                    <div className="p-3 rounded-4 interactive-box text-center h-100">
                                        <i className="bi bi-file-earmark-text fs-3 text-primary mb-2 d-block"></i>
                                        <span className="small fw-bold text-dark d-block">Content Manager</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-6 col-md-4">
                                <Link to="/admin/users" className="text-decoration-none">
                                    <div className="p-3 rounded-4 interactive-box text-center h-100">
                                        <i className="bi bi-people fs-3 text-secondary mb-2 d-block"></i>
                                        <span className="small fw-bold text-dark d-block">User Management</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-12 col-md-4">
                                <Link to="/admin/announcements" className="text-decoration-none">
                                    <div className="p-3 rounded-4 interactive-box text-center h-100">
                                        <i className="bi bi-megaphone fs-3 text-accent mb-2 d-block"></i>
                                        <span className="small fw-bold text-dark d-block">Announcements</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
