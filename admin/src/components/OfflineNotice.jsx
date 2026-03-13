import React, { useState, useEffect } from 'react';

const OfflineNotice = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOffline(false);
        const goOffline = () => setIsOffline(true);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="offline-notice fixed-top w-100" style={{ zIndex: 9999 }}>
            <div className="bg-danger text-white text-center py-2 px-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-wifi-off fs-5"></i>
                <span className="small fw-bold">You are currently offline. Please turn on your internet data to access the latest content and features.</span>
            </div>
        </div>
    );
};

export default OfflineNotice;
