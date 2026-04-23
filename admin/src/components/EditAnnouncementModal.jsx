import React, { useState } from 'react';
import api from '../services/api';

export default function EditAnnouncementModal({ item, onClose, onUpdate }) {
  // FIX: Saare fields ko ek hi formData object mein rakhte hain
  // Safety check ke liye item?.field || '' use kiya hai
  const [formData, setFormData] = useState({
    title: item?.title || '',
    content: item?.content || '',
    redirectLink: item?.redirectLink || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Backend ko updated formData bhej rahe hain
      const { data: updatedItem } = await api.put(`/announcements/${item._id}`, formData);
      onUpdate(updatedItem);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-primary">
                <i className="bi bi-pencil-square me-2"></i>Edit Announcement
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Title Field */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm bg-light"
                    id="editAnnTitle"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <label htmlFor="editAnnTitle">Title</label>
                </div>

                {/* Content Field */}
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control border-0 shadow-sm bg-light"
                    id="editAnnContent"
                    placeholder="Content..."
                    style={{ height: '120px' }}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  ></textarea>
                  <label htmlFor="editAnnContent">Content</label>
                </div>

                {/* Redirect Link Field (Added Fix) */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-link-45deg me-1"></i>Redirect Link (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm bg-light"
                    value={formData.redirectLink}
                    onChange={(e) => setFormData({ ...formData, redirectLink: e.target.value })}
                    placeholder="/materials or https://..."
                  />
                  <div className="form-text extra-small" style={{ fontSize: '0.65rem' }}>
                    Leave blank for default detail page.
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light w-100 fw-bold rounded-pill" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}