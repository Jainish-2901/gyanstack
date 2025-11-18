import React, { useState } from 'react';
import api from '../services/api'; // Path ko fix kiya gaya hai

// 'categories' prop ko AdminPanel se receive karein
export default function EditContentModal({ item, onClose, onUpdate, categories }) {
  
  // Form state ko 'item' se initialize karein
  const [title, setTitle] = useState(item.title);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [tags, setTags] = useState(item.tags.join(', ')); // Array ko string mein badlein
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

                {/* --- CHANGE: File Replace ka option --- */}
                {/* Ye 'note' ya 'link' type ke liye nahi dikhega */}
                {(item.fileResourceType === 'raw' || item.fileResourceType === 'image' || item.fileResourceType === 'video') && (
                  <div className="mb-3 p-3 border rounded bg-light">
                    <label htmlFor="editFile" className="form-label fw-bold">Replace File (Optional)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      id="editFile" 
                      onChange={(e) => setFile(e.target.files[0])} 
                    />
                    <div className="form-text mt-2">
                      Current file: <span className="text-muted">{item.url.split('/').pop()}</span>
                      <br/>
                      Select a new file to replace it. Leave blank to keep the current file.
                    </div>
                  </div>
                )}
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