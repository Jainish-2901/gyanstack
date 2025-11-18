import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // API use karein

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // API call to backend (only approved announcements)
        const { data } = await api.get('/announcements?status=approved'); 
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
        <div key={item._id} className="alert alert-info announcement-item shadow-sm">
          <h5 className="alert-heading fw-bold">{item.title}</h5>
          <p className="small">{item.content}</p>
          <hr />
          <p className="mb-0 small">
            Posted on: {new Date(item.createdAt).toLocaleDateString()}
            <Link to="/announcements" className='float-end text-primary fw-bold'>View Details</Link>
          </p>
        </div>
      ))}
    </div>
  );
}