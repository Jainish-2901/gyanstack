import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // API use karein

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Showing only approved announcements from last 48 hours (2 days)
        const { data } = await api.get('/announcements?status=approved&days=2'); 
        // Showing only first 3 announcements for the banner
        setAnnouncements(data.announcements.slice(0, 3)); 
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="alert alert-secondary text-center shadow-sm">
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading announcements...
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="container mb-4 fade-in">
      <h3 className="fw-bold mb-3 text-primary">Latest Announcements</h3>
      {announcements.map((item) => (
        <div key={item._id} className="alert alert-info announcement-item shadow-sm border-0 glass-panel mb-3">
          <h5 className="alert-heading fw-bold mb-1">{item.title}</h5>
          <p className="content-text small mb-2">
            {item.content.length > 150 
              ? `${item.content.substring(0, 150)}...` 
              : item.content}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-info border-opacity-10">
            <span className="date-text x-small text-muted">
              <i className="bi bi-calendar3 me-1"></i> {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <Link to="/announcements" className='btn-view-details text-primary fw-bold text-decoration-none small'>
              View Details <i className="bi bi-arrow-right-short"></i>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}