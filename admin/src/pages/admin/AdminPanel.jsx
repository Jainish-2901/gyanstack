import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Sahi import path
import api from '../../services/api'; // Sahi import path
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen'; // Sahi import path
import EditContentModal from '../../components/EditContentModal'; // Sahi import path
import CategoryManager from '../../components/CategoryManager'; // Sahi import path
// -------------------

// --- 1. HELPER COMPONENT: Content Card for Mobile View ---
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

const ContentCardMobile = ({ item, categoryMap, handleEditClick, handleDelete, isSelected, onToggleSelect }) => (
  <div className={`card mb-2 border-0 rounded-3 overflow-hidden transition-all w-100 ${isSelected ? 'border-primary' : 'border-light'}`} style={{
    boxShadow: isSelected ? '0 4px 6px -1px rgba(99, 102, 241, 0.1)' : 'none',
    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.02)' : '#fff',
    border: '1px solid',
    borderColor: isSelected ? '#6366f1' : '#f1f1f1'
  }}>
    <div className="card-body p-3">
      {/* 1. Header Row: Title (Full Space) */}
      <div className="mb-3">
        <div className="fw-bold text-dark" style={{ 
          fontSize: '1.05rem', 
          lineHeight: '1.3',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          display: 'block'
        }}>
          {item.title}
        </div>
      </div>

      <div className="d-flex gap-3">
        {/* 2. Left Side: checkbox */}
        <div className="d-flex align-items-start pt-1">
          <input
            type="checkbox"
            className="form-check-input flex-shrink-0 m-0 cursor-pointer"
            style={{ width: '20px', height: '20px', borderRadius: '4px' }}
            checked={isSelected}
            onChange={() => onToggleSelect(item._id)}
          />
        </div>

        {/* 3. Right Side: Metadata & Actions */}
        <div className="flex-grow-1 min-w-0">
          <div className="mb-3" style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <span className="badge bg-light text-dark fw-normal border-0 p-0 me-2">{item.type}</span>
            <div className="mt-1 d-flex align-items-center gap-1">
              <i className="bi bi-folder2 text-primary"></i>
              <span className="fw-medium text-break" style={{ wordBreak: 'break-word' }}>
                {categoryMap[item.categoryId] || 'Uncategorized'}
              </span>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3 text-muted mb-3" style={{ fontSize: '0.8rem' }}>
            <span><i className="bi bi-eye me-1"></i>{item.viewsCount}</span>
            <span><i className="bi bi-heart me-1"></i>{item.likesCount}</span>
          </div>

            <a
              href={`${SITE_URL}/content/${item._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-info border-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
              title="View Details"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-eye" style={{ fontSize: '1rem' }}></i>
            </a>
            <button
              className="btn btn-sm btn-outline-warning border-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => handleEditClick(item)}
              title="Edit"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-pencil-square" style={{ fontSize: '1rem' }}></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger border-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => handleDelete(item._id)}
              title="Delete"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-trash3" style={{ fontSize: '1rem' }}></i>
            </button>
          </div>
        </div>
    </div>
  </div>
);



export default function AdminPanel() {
  const { user } = useAuth();

  // States for Upload Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('note');
  const [files, setFiles] = useState(null); // Ab files array store karega (Batch Upload)
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');

  // Category state
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('None Selected');

  const [uploadMode, setUploadMode] = useState('single'); // 'single', 'batch', or 'external'
  const [externalMimeType, setExternalMimeType] = useState('application/pdf'); // for external Drive links

  // --- NAYA STATE: Category Map ---
  const [categoryMap, setCategoryMap] = useState({});
  // ------------------------------

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // For progress bar
  const [statusPhase, setStatusPhase] = useState(''); // '', 'uploading', 'processing', 'saving'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for Content Management
  const [myContent, setMyContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // --- NAYA STATE: Bulk Selection & Search ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // ----------------------------------

  // Fetch content, announcements, AND categories
  const fetchData = async () => {
    setLoadingContent(true);

    // --- CHANGE: Ab hum Categories ko bhi fetch karenge (Map banane ke liye) ---
    try {
      const { data: categoryData } = await api.get('/categories/all-nested');

      const map = {};
      const buildMap = (categories) => {
        for (const cat of categories) {
          map[cat._id] = cat.name;
          if (cat.children && cat.children.length > 0) {
            buildMap(cat.children);
          }
        }
      };
      const categoriesList = categoryData.categories || categoryData;
      buildMap(categoriesList);
      setCategoryMap(map);

    } catch (err) {
      console.warn('Could not fetch category map. Using simple list.');
      // Fallback
      try {
        const { data: categoryData } = await api.get('/categories');
        const map = {};
        const categoriesList = categoryData.categories || categoryData;
        categoriesList.forEach(cat => { map[cat._id] = cat.name; });
        setCategoryMap(map);
      } catch (catErr) {
        setError('Failed to fetch categories. Content table might show IDs.');
      }
    }
    // --------------------------------------------------

    try {
      const { data: contentData } = await api.get('/content/my-content');
      setMyContent(contentData.content);
    } catch (err) {
      setError('Failed to fetch your content.');
    }
    setLoadingContent(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- BATCH UPLOAD CHANGE ---
  const handleFileChange = (e) => {
    // FileList object ko files state mein store karein
    setFiles(e.target.files);
  };
  // ---------------------------

  // Upload Logic
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!categoryId || categoryId === 'root') {
      setError('Please select a valid category (not Root).');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setStatusPhase('uploading');
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('categoryId', categoryId);
    formData.append('tags', tags);
    formData.append('uploadMode', uploadMode);
    // Send explicit MIME type for external links so backend doesn't have to guess
    if (type === 'file' && uploadMode === 'external') {
      formData.append('externalMimeType', externalMimeType);
    }

    // --- BATCH UPLOAD LOGIC ---
    if (type === 'file' && uploadMode !== 'external' && files && files.length > 0) {
      // Single mode validation
      if (uploadMode === 'single' && files.length > 1) {
        setError('Please select only one file for Single Upload mode.');
        setUploading(false);
        return;
      }

      // Batch mode validation (Limit: 10 files)
      if (uploadMode === 'batch' && files.length > 10) {
        setError('Maximum 10 files allowed per batch for stability.');
        setUploading(false);
        return;
      }

      // Har file ko FormData mein 'files' field ke naam se append karein
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else if (type === 'link' || (type === 'file' && uploadMode === 'external')) {
      formData.append('link', link);
    } else if (type === 'note') {
      formData.append('textNote', note);
    }
    // --------------------------

    try {
      const { data } = await api.post('/content', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setStatusPhase('processing');
          }
        }
      });
      setStatusPhase('');
      setSuccess(data.message || 'Content uploaded successfully!');

      // Form reset karein
      setTitle(''); setType('note'); setFiles(null); setLink(''); setNote(''); setTags('');
      setCategoryId(''); setCategoryName('None Selected');
      setExternalMimeType('application/pdf');
      setUploadProgress(0);
      fetchData(); // Sabkuch refresh karein
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check server.');
      setUploadProgress(0);
    }
    setUploading(false);
  };

  // Delete Logic
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      fetchData();
    } catch (err) {
      setError('Failed to delete content.');
    }
  };

  // --- NAYA: Bulk Delete Logic ---
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

    try {
      setLoadingContent(true);
      await api.delete('/content/bulk-delete', { data: { ids: selectedIds } });
      setSelectedIds([]);
      setSuccess(`${selectedIds.length} items deleted successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk delete failed.');
      setLoadingContent(false);
    }
  };

  const filteredContent = myContent.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoryMap[item.categoryId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContent.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContent.map(item => item._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  // -------------------------------

  // Edit Logic
  const handleEditClick = (item) => { setCurrentItem(item); setIsEditing(true); };
  const handleUpdateItem = (updatedItem) => {
    setMyContent(myContent.map(item => item._id === updatedItem._id ? updatedItem : item));
    setSuccess('Content updated successfully!');
  };



  return (
    // --- DASHBOARD LAYOUT MEIN WRAP KAREIN ---
    <>
      <div className="container-fluid fade-in px-3 px-md-4 overflow-x-hidden" style={{ overflowX: 'hidden' }}>
        <h3 className="fw-bold mb-4 text-primary text-break">Content Manager</h3>

        {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
        {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

        <style dangerouslySetInnerHTML={{
          __html: `
            .stylish-search-group {
                background: #f1f5f9;
                border: none;
                border-radius: 12px;
                padding: 4px 12px;
                transition: all 0.2s ease;
            }
            .stylish-search-group:focus-within {
                background: #fff;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
                transform: translateY(-1px);
            }
            .stylish-search-input, 
            .stylish-search-input:focus, 
            .stylish-search-input:active {
                background: transparent !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                font-weight: 500;
                font-size: 0.95rem;
            }
            .stylish-search-input::placeholder {
                color: #94a3b8;
                font-weight: 400;
            }
            .check-all-mobile-box {
                background: #f1f5f9;
                border-radius: 10px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .check-all-mobile-box:active {
                background: #e2e8f0;
            }
            .form-check-input {
                border: 2px solid #cbd5e1 !important;
                cursor: pointer;
            }
            .form-check-input:checked {
                background-color: #6366f1 !important;
                border-color: #6366f1 !important;
            }
        `}} />

        <div className="row gx-0 gx-lg-2 gy-4 align-items-start justify-content-center min-vh-md-75 admin-row mx-0">
          {/* Left Column: Upload Form */}
          <div className="col-lg-8 col-md-12 pe-lg-2" style={{ minWidth: 0 }}>
            <div className="card border-0 rounded-3 mb-4">
              <div className="card-body p-4 p-sm-4">
                <h4 className="fw-bold mb-4 text-primary">Upload New Content</h4>

                {/* Content Type Selector */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Step 1: Select Type</label>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className={`btn ${type === 'note' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setType('note')}
                    >
                      <i className="bi bi-card-text me-2"></i>Text Note
                    </button>
                    <button
                      type="button"
                      className={`btn ${type === 'link' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setType('link')}
                    >
                      <i className="bi bi-link-45deg me-2"></i>Link
                    </button>
                    <button
                      type="button"
                      className={`btn ${type === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setType('file')}
                    >
                      <i className="bi bi-file-earmark-plus me-2"></i>File(s)
                    </button>
                  </div>
                </div>

                {/* Mode Selector for Files */}
                {type === 'file' && (
                  <div className="mb-4 p-3 bg-light rounded-3">
                    <label className="form-label fw-bold d-block mb-3">Step 2: Upload Mode</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="uploadMode"
                        id="modeSingle"
                        autoComplete="off"
                        checked={uploadMode === 'single'}
                        onChange={() => setUploadMode('single')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="modeSingle">
                        <i className="bi bi-file-earmark me-2"></i>Single File Upload
                      </label>

                       <input
                        type="radio"
                        className="btn-check"
                        name="uploadMode"
                        id="modeBatch"
                        autoComplete="off"
                        checked={uploadMode === 'batch'}
                        onChange={() => setUploadMode('batch')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="modeBatch">
                        <i className="bi bi-files me-2"></i>Batch Upload
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="uploadMode"
                        id="modeExternal"
                        autoComplete="off"
                        checked={uploadMode === 'external'}
                        onChange={() => setUploadMode('external')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="modeExternal">
                        <i className="bi bi-link-45deg me-2"></i>External Link
                      </label>
                    </div>
                    <small className="text-muted mt-2 d-block">
                      {uploadMode === 'single'
                        ? '⚠️ Upload one file with a custom title. Max 4.5MB (Vercel server limit).'
                        : uploadMode === 'batch'
                        ? '⚠️ Upload multiple files. Max 4.5MB each (Vercel server limit).'
                        : '✅ No size limit! Upload your file to Google Drive → set "Anyone with link → Viewer" → paste link here.'}
                    </small>
                  </div>
                )}

                <hr className="my-4 opacity-10" />

                <form onSubmit={handleUpload}>
                  {/* Title (Only for Single/Note/Link/External) */}
                  {(type !== 'file' || uploadMode === 'single' || uploadMode === 'external') && (
                    <div className="form-floating mb-3">
                      <input type="text" className="form-control" id="title" placeholder="Content Title" value={title} onChange={(e) => setTitle(e.target.value)} required={uploadMode === 'single' || uploadMode === 'external' || type !== 'file'} />
                      <label htmlFor="title">Content Title</label>
                    </div>
                  )}

                  {/* --- NAYA CATEGORY SELECTOR --- */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Step 3: Select Category</label>
                    <div className="p-3 border rounded-3 bg-light overflow-hidden shadow-sm">
                      <p className="mb-2">Selected: <span className="fw-bold text-primary">{categoryName}</span></p>
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <CategoryManager
                          onSelectCategory={(id, name) => {
                            setCategoryId(id);
                            setCategoryName(name);
                          }}
                          isSelectOnly={true}
                        />
                      </div>
                    </div>
                  </div>
                  {/* ----------------------------- */}

                  {/* Content Type */}
                  <select className="form-select mb-3" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="note">Text Note</option>
                    <option value="link">Link (YouTube, Website)</option>
                    <option value="file">File (PDF, PPT, DOCX, Video, Images, Zip, etc.)</option>
                  </select>

                  {/* Type ke hisaab se input */}
                  {type === 'note' && (
                    <div className="form-floating mb-3">
                      <textarea className="form-control" id="note" placeholder="Write your note..." style={{ height: '150px' }} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                      <label htmlFor="note">Text Note</label>
                    </div>
                  )}
                  {type === 'link' && (
                    <div className="form-floating mb-3">
                      <input type="url" className="form-control" id="link" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
                      <label htmlFor="link">URL</label>
                    </div>
                  )}
                  {type === 'file' && (
                    <div className="mb-3">
                      {uploadMode === 'external' ? (
                        <div className="mb-3">
                          <div className="form-floating mb-2">
                            <input 
                              type="url" 
                              className="form-control" 
                              id="externalFileLink" 
                              placeholder="Paste Google Drive Link" 
                              value={link} 
                              onChange={(e) => setLink(e.target.value)} 
                              required 
                            />
                            <label htmlFor="externalFileLink">Paste Google Drive Link</label>
                          </div>
                          {/* File type selector — required since Drive share URLs have no extension */}
                          <label className="form-label fw-semibold small"><i className="bi bi-file-earmark me-1"></i>File Type <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            value={externalMimeType}
                            onChange={(e) => setExternalMimeType(e.target.value)}
                          >
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
                          <small className="text-muted mt-1 d-block"><i className="bi bi-info-circle me-1"></i> Ensure link is set to "Anyone with the link can view"</small>
                        </div>
                      ) : (
                        <>
                          <label htmlFor="files" className="form-label fw-bold">
                            {uploadMode === 'single' ? 'Step 4: Select Single File' : 'Step 4: Select Multiple Files (Max 10)'}
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="files"
                            onChange={handleFileChange}
                            multiple={uploadMode === 'batch'}
                            accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.avi,.sifz,.XLS,.odt,image/*,video/*"
                            required
                          />
                          {files && files.length > 0 && (
                            <div className="mt-2 p-3 bg-light rounded border border-success border-opacity-25 overflow-auto" style={{ maxHeight: '150px' }}>
                              <p className="small fw-bold text-success mb-2">
                                Selected {files.length} file(s):
                              </p>
                              <ul className="list-unstyled mb-0 small">
                                {Array.from(files).map((f, i) => (
                                  <li key={i} className="text-truncate">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    {f.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="tags" placeholder="e.g., IMP, Unit-1, Exam" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <label htmlFor="tags">Tags (comma se alag karein, e.g., IMP, Unit-1)</label>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    {uploading && (
                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1 small fw-bold">
                          <span className="text-primary">
                            <i className={`bi ${statusPhase === 'uploading' ? 'bi-cloud-arrow-up' : 'bi-gear-wide-connected'} me-1 animate-pulse`}></i>
                            {statusPhase === 'uploading' && `Uploading to Server (${uploadProgress}%)`}
                            {statusPhase === 'processing' && 'Optimizing & Securing on Drive...'}
                          </span>
                        </div>
                        <div className="progress overflow-visible" style={{ height: '10px' }}>
                          <div
                            className={`progress-bar progress-bar-striped progress-bar-animated shadow-sm ${statusPhase === 'processing' ? 'bg-success' : 'bg-primary'}`}
                            role="progressbar"
                            style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}
                          ></div>
                        </div>
                        <div className="mt-2 x-small text-muted text-center italic">
                          {statusPhase === 'processing' && (
                            <span><i className="bi bi-info-circle me-1"></i> Large files might take 20-30 seconds to compress and sync.</span>
                          )}
                        </div>
                      </div>
                    )}
                    <button className="btn btn-primary d-flex align-items-center justify-content-center py-2 fw-bold text-uppercase" type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Please wait...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-up-fill me-2 fs-5"></i>
                          Upload Content
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Manage Categories & Announcements */}
          <div className="col-lg-4 col-md-12" style={{ minWidth: 0 }}>
            {/* Naya Category Manager (Admin bhi manage kar sakta hai) */}
            <div className="card border-0 rounded-3 mb-4">
              <CategoryManager
                isSelectOnly={false} // Yahaan poori functionality (add/edit/delete/reorder) dikhegi
              />
            </div>
          </div>
        </div>

        {/* Content Management Table */}
        <div className="row mt-4 mb-5 mx-0 gx-0">
          <div className="col-12">
            <div className="card border-0 rounded-3 overflow-hidden">
              <div className="card-header border-0 bg-transparent px-3 pb-3">
                <div className="row g-3 align-items-center">
                  {/* Left Side: Title & Actions */}
                  <div className="col-12 col-md-6 ps-md-4">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <h5 className="fw-bold mb-0 text-dark">
                        <i className="bi bi-stack me-2 text-primary"></i>Manage Your Content
                      </h5>

                      {/* Desktop Select All */}
                      <div className="form-check d-none d-lg-block mb-0 ms-2">
                        <input
                          type="checkbox"
                          className="form-check-input cursor-pointer shadow-none"
                          id="selectAllDesktop"
                          style={{ width: '18px', height: '18px' }}
                          checked={filteredContent.length > 0 && selectedIds.length === filteredContent.length}
                          onChange={toggleSelectAll}
                        />
                        <label className="form-check-label small fw-bold text-muted cursor-pointer ms-1" htmlFor="selectAllDesktop">
                          Select All
                        </label>
                      </div>

                      {selectedIds.length > 0 && (
                        <button className="btn btn-danger btn-sm rounded-3 px-3 py-2 fw-bold shadow-sm animate-pulse" onClick={handleBulkDelete}>
                          <i className="bi bi-trash3-fill me-2"></i>
                          Delete {selectedIds.length}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Search Bar */}
                  <div className="col-12 col-md-6 text-md-end pe-md-4">
                    <div className="stylish-search-group d-flex align-items-center ms-md-auto" style={{ maxWidth: '400px', width: '100%' }}>
                      <i className="bi bi-search text-primary ms-1 me-2"></i>
                      <input
                        type="text"
                        className="form-control stylish-search-input py-2"
                        placeholder="Search your content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Check All Section */}
                <div className="d-lg-none mt-4 px-1">
                  <div className="check-all-mobile-box shadow-sm" onClick={toggleSelectAll}>
                    <input
                      type="checkbox"
                      className="form-check-input m-0 cursor-pointer"
                      style={{ width: '22px', height: '22px' }}
                      checked={filteredContent.length > 0 && selectedIds.length === filteredContent.length}
                      readOnly
                    />
                    <span className="fw-bold text-dark">Select All Content</span>
                    <span className="badge bg-white text-primary border ms-auto">{filteredContent.length} Items</span>
                  </div>
                </div>

                {!loadingContent && myContent.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-2 px-md-2">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 py-1 px-3 small">
                      {myContent.length} Total
                    </span>
                    <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-10 py-1 px-3 small">
                      {myContent.filter(c => c.type === 'note').length} Notes
                    </span>
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 py-1 px-3 small">
                      {myContent.filter(c => c.type === 'link').length} Links
                    </span>
                    <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10 py-1 px-3 small">
                      {myContent.filter(c => c.type !== 'note' && c.type !== 'link').length} Files
                    </span>
                  </div>
                )}
              </div>
              <div className="card-body p-0 responsive-card-view">
                {loadingContent ? (
                  <LoadingScreen text="Loading your content..." />
                ) : myContent.length === 0 ? (
                  <p className='p-3'>You have not uploaded any content yet.</p>
                ) : (
                  <>
                    {/* DESKTOP VIEW: Table */}
                    <div className="table-responsive d-none d-lg-block">
                      <table className="table table-striped table-hover align-middle">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={filteredContent.length > 0 && selectedIds.length === filteredContent.length}
                                onChange={toggleSelectAll}
                              />
                            </th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContent.map(item => (
                            <tr key={item._id} className={selectedIds.includes(item._id) ? 'table-primary' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedIds.includes(item._id)}
                                  onChange={() => toggleSelect(item._id)}
                                />
                              </td>
                              <td style={{ maxWidth: '300px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                <div style={{ 
                                  fontWeight: '500',
                                  whiteSpace: 'normal'
                                }}>
                                  {item.title}
                                </div>
                              </td>
                              <td><span className="badge bg-secondary">{item.type}</span></td>

                              <td>
                                <span className="fw-medium text-dark">
                                  {categoryMap[item.categoryId] || <span className='text-danger'>Unknown</span>}
                                </span>
                              </td>

                              <td>
                                <div className="d-flex gap-2">
                                  <a
                                    href={`${SITE_URL}/content/${item._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-info border-0 px-2"
                                    title="View Live"
                                  >
                                    <i className="bi bi-eye fs-5"></i>
                                  </a>
                                  <button
                                    className="btn btn-sm btn-outline-warning border-0 px-2"
                                    onClick={() => handleEditClick(item)}
                                    title="Edit"
                                  >
                                    <i className="bi bi-pencil-square fs-5"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger border-0 px-2"
                                    onClick={() => handleDelete(item._id)}
                                    title="Delete"
                                  >
                                    <i className="bi bi-trash3 fs-5"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE VIEW: Cards */}
                    <div className="d-lg-none p-3">
                      {filteredContent.length === 0 ? (
                        <p className="text-center text-muted py-4">No matching content found.</p>
                      ) : (
                        filteredContent.map(item => (
                          <ContentCardMobile
                            key={item._id}
                            item={item}
                            categoryMap={categoryMap}
                            handleEditClick={handleEditClick}
                            handleDelete={handleDelete}
                            isSelected={selectedIds.includes(item._id)}
                            onToggleSelect={toggleSelect}
                          />
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isEditing && currentItem && (
          <EditContentModal
            item={currentItem}
            onClose={() => setIsEditing(false)}
            onUpdate={handleUpdateItem}
            // Modal ko category map pass karein
            categories={categoryMap}
          />
        )}
      </div>
    </>
  );
}
