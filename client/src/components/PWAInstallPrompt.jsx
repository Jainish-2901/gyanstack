import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the install button
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for internal triggers from other components
        const triggerHandler = () => {
            if (deferredPrompt) handleInstallClick();
        };
        window.addEventListener('trigger-pwa-install', triggerHandler);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('trigger-pwa-install', triggerHandler);
        };
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the PWA install prompt');
        } else {
            console.log('User dismissed the PWA install prompt');
        }

        // We've used the prompt, and can't use it again
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="pwa-install-banner fixed-bottom mx-3 mb-3 fade-in" style={{ zIndex: 2000 }}>
            <div className="glass-panel p-3 shadow-lg border-primary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-3"
                style={{ maxWidth: '600px', marginLeft: 'auto', borderLeft: '5px solid var(--primary)' }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                        <i className="bi bi-cloud-arrow-down-fill fs-3"></i>
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0">Install GyanStack App</h6>
                        <p className="text-muted small mb-0">Faster access & Online study.</p>
                    </div>
                </div>
                <div className="d-flex gap-2 w-100 w-sm-auto justify-content-end">
                    <button className="btn btn-sm btn-light text-muted fw-bold px-3 border-0" onClick={() => setIsVisible(false)}>
                        Later
                    </button>
                    <button className="btn btn-sm btn-primary fw-bold px-4 rounded-pill shadow-sm" onClick={handleInstallClick}>
                        <i className="bi bi-download me-2"></i>Install Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
