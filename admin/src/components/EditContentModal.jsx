import React, { useState } from 'react';
import api from '../services/api'; // Path ko fix kiya gaya hai

// 'categories' prop ko AdminPanel se receive karein
export default function EditContentModal({ item, onClose, onUpdate, categories }) {
  
  // Form state ko 'item' se initialize karein
  const [title, setTitle] = useState(item.title);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [tags, setTags] = useState((item.tags || []).join(', ')); // Array ko string mein badlein
  const [url, setUrl] = useState(item.url || '');
  const [textNote, setTextNote] = useState(item.textNote || '');
  const [file, setFile] = useState(null); // Naya state file replace ke liye
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // --- CHANGE: Ab FormData ka use karenge ---
    // Kyunki humein file bhi bhejni ho sakti hai
    const formData = new FormData();
    formData.append('title', title);
    formData.append('categoryId', categoryId);
    formData.append('tags', tags);
    
    if (item.type === 'link') {
      formData.append('url', url);
    } else if (item.type === 'note') {
      formData.append('textNote', textNote);
    }
    
    // Agar user ne nayi file select ki hai, tabhi use append karein
    if (file) {
      formData.append('file', file);
    }
    // ----------------------------------------
    
    try {
      // Backend API ko update request bhej
      // (Backend pehle se hi multipart/form-data ke liye setup hai)
      const { data: updatedItem } = await api.put(`/content/${item._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUpdate(updatedItem); // Parent component (AdminPanel) ki list ko update karein
      onClose(); // Modal band karein
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update content.');
    }
    setLoading(false);
  };

  return (
    // Bootstrap Modal HTML
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Content: {item.title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="editTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <label htmlFor="editTitle">Content Title</label>
                </div>
                
                {/* --- CHANGE: Category ID input ki jagah Dropdown --- */}
                <div className="form-floating mb-3">
                  <select
                    className="form-select"
                    id="editCategory"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {/* categories map (object) se loop karein */}
                    {Object.entries(categories).map(([catId, catName]) => (
                      <option key={catId} value={catId}>
                        {catName}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="editCategory">Category</label>
                </div>
                {/* -------------------------------------------------- */}

                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="editTags" value={tags} onChange={(e) => setTags(e.target.value)} />
                  <label htmlFor="editTags">Tags (comma se alag)</label>
                </div>

                {/* --- NAYA: Edit Link or Note Content --- */}
                {item.type === 'link' && (
                  <div className="form-floating mb-3">
                    <input type="url" className="form-control" id="editUrl" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
                    <label htmlFor="editUrl">URL Link</label>
                  </div>
                )}

                {item.type === 'note' && (
                  <div className="form-floating mb-3">
                    <textarea className="form-control" id="editNote" placeholder="Write your note..." style={{ height: '150px' }} value={textNote} onChange={(e) => setTextNote(e.target.value)} required></textarea>
                    <label htmlFor="editNote">Text Note</label>
                  </div>
                )}

                {/* --- ENHANCED: Resource & File Replace Logic --- */}
                <div className="mb-3 p-3 border rounded bg-light shadow-sm">
                  <label className="form-label fw-bold d-flex align-items-center">
                    <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                    Resource Management
                  </label>
                  
                  <div className="current-resource mb-3 p-2 bg-white rounded border small">
                    <div className="text-muted mb-1 x-small text-uppercase fw-bold">Current Resource Location:</div>
                    <div className="d-flex align-items-center">
                      <i className={`bi ${item.googleDriveId ? 'bi-google-drive text-success' : (item.type === 'link' ? 'bi-link-45deg text-info' : 'bi-card-text text-secondary')} me-2 fs-5`}></i>
                      <span className="text-truncate flex-grow-1 fw-medium">
                        {item.googleDriveId ? (
                           <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1">Google Drive Secure Link</span>
                        ) : (
                          item.type === 'note' ? 'Internal Database Note' : (item.url || 'No URL')
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Only show file upload if it's not a simple note/link OR if it's already a drive resource */}
                  {(item.googleDriveId || (item.url && item.fileResourceType !== 'auto')) && (
                    <div className="replacement-section">
                      <label htmlFor="editFile" className="form-label small fw-bold">Replace with New File</label>
                      <input 
                        type="file" 
                        className="form-control form-control-sm" 
                        id="editFile" 
                        accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.avi,.sifz,.XLS,.odt,image/*,video/*"
                        onChange={(e) => setFile(e.target.files[0])} 
                      />
                      <div className="form-text x-small mt-2">
                        <i className="bi bi-info-circle-fill me-1 text-info"></i>
                        Selecting a new file will <strong>automatically replace</strong> the old one on Google Drive, Server, and Website.
                      </div>
                    </div>
                  )}
                </div>
                {/* -------------------------------------- */}

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