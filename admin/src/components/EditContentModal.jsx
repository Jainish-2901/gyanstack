import React, { useState } from 'react';
import api from '../services/api'; 

export default function EditContentModal({ item, onClose, onUpdate, categories }) {
  
  const [title, setTitle] = useState(item?.title || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId || '');
  const [tags, setTags] = useState((item?.tags || []).join(', '));
  const [url, setUrl] = useState(item?.url || '');
  const [textNote, setTextNote] = useState(item?.textNote || '');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(item?.type || '');
  
  if (!item) return null;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('categoryId', categoryId);
    formData.append('tags', tags);
    if (fileType) formData.append('fileType', fileType);
    
    if (item.type === 'link') {
      formData.append('url', url);
    } else if (item.type === 'note') {
      formData.append('textNote', textNote);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    try {
      const { data: updatedItem } = await api.put(`/content/${item._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUpdate(updatedItem); 
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update content.');
    }
    setLoading(false);
  };

  return (
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
                
                <div className="form-floating mb-3">
                  <select
                    className="form-select"
                    id="editCategory"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="root">Root / General</option>
                    {Object.entries(categories || {}).map(([catId, catName]) => {
                      if (catId === 'root') return null; 
                      return (
                        <option key={catId} value={catId}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                  <label htmlFor="editCategory">Category</label>
                </div>

                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="editTags" value={tags} onChange={(e) => setTags(e.target.value)} />
                  <label htmlFor="editTags">Tags (comma se alag)</label>
                </div>

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
                  {(item.googleDriveId || item.type?.includes('octet') || item.fileResourceType === 'raw') && (
                    <div className="mt-3">
                      <label className="form-label small fw-bold"><i className="bi bi-file-earmark-fill me-1 text-primary"></i>File Type</label>
                      <select className="form-select form-select-sm" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                        <option value="application/pdf">📄 PDF Document</option>
                        <option value="application/msword">📝 Word Document (.doc)</option>
                        <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">📝 Word Document (.docx)</option>
                        <option value="application/vnd.ms-powerpoint">📊 PowerPoint (.ppt)</option>
                        <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">📊 PowerPoint (.pptx)</option>
                        <option value="application/vnd.ms-excel">📈 Excel (.xls)</option>
                        <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">📈 Excel (.xlsx)</option>
                        <option value="video/mp4">🎬 Video (MP4)</option>
                        <option value="image/jpeg">🖼️ Image (JPG/PNG)</option>
                        <option value="application/zip">🗜️ ZIP Archive</option>
                        <option value="application/octet-stream">❓ Other / Unknown</option>
                      </select>
                    </div>
                  )}
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