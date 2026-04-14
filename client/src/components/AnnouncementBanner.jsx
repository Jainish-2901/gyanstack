import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AnnouncementBanner() {
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchAnnouncements = async () => {
         try {
            const { data } = await api.get('/announcements?status=approved&limit=1');
            setAnnouncements(data.announcements);
         } catch (error) {
            console.error("Error fetching announcements:", error);
         }
         setLoading(false);
      };
      fetchAnnouncements();
   }, []);

   if (loading || announcements.length === 0) {
      return null;
   }

   const latest = announcements[0];

   return (
      <div className="container mb-4 fade-in" style={{ marginTop: '-15px' }}>
         <div className="glass-panel border-primary border-opacity-10 shadow-sm rounded-pill p-2 ps-3 d-flex align-items-center gap-3 bg-white bg-opacity-75 overflow-hidden" style={{ minHeight: '55px' }}>
            {/* Badge */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
               <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="bi bi-megaphone-fill text-white small"></i>
               </div>
               <span className="fw-bold text-primary small text-uppercase tracking-wider d-none d-md-inline" style={{ fontSize: '0.7rem' }}>Updates</span>
            </div>

            {/* Separator */}
            <div className="vr d-none d-md-block opacity-10 mx-1" style={{ height: '50px' }}></div>

            {/* Content Scroll/Ticker Area */}
            <div className="flex-grow-1 overflow-hidden me-2">
               <Link to="/announcements" className="text-decoration-none d-flex align-items-center gap-2">
                  <span className="badge bg-light text-muted fw-normal border d-none d-sm-inline-block" style={{ fontSize: '0.65rem' }}>
                     {new Date(latest.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-dark fw-bold small text-truncate d-block">
                     {latest.title}
                  </span>
               </Link>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 pe-1">
               <Link to="/announcements" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span className="d-none d-sm-inline me-1">View Details</span>
                  <i className="bi bi-arrow-right-short fs-5"></i>
               </Link>
            </div>
         </div>
      </div>
   );
}
