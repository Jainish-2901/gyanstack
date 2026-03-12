import React, { useState } from 'react';
import api from '../services/api';

export default function EditAnnouncementModal({ item, onClose, onUpdate }) {
  // Form state ko 'item' se initialize karein
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Backend API ko update request bhej
      const { data: updatedItem } = await api.put(`/announcements/${item._id}`, {
        title,
        content,
      });
      onUpdate(updatedItem); // Parent component ki list ko update karein
      onClose(); // Modal band karein
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement.');
    }
    setLoading(false);
  };

  return (
    // Bootstrap Modal HTML
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Announcement</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="editAnnTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <label htmlFor="editAnnTitle">Title</label>
                </div>
                <div className="form-floating mb-3">
                  <textarea className="form-control" id="editAnnContent" placeholder="Content..." style={{ height: '100px' }} value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
                  <label htmlFor="editAnnContent">Content</label>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}