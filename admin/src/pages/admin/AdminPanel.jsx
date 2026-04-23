import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMyContent, useAdminContentMutation } from '../../hooks/useAdminContent';
import { useCategoryMap } from '../../hooks/useAdminCategories';
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';
import EditContentModal from '../../components/EditContentModal';
import CategoryManager from '../../components/CategoryManager';
import api from '../../services/api';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

// ── Humanize file type ────────────────────────────────────────────
const getTypeInfo = (type = '') => {
  const t = type.toLowerCase();
  if (t === 'note' || t === 'text/plain') return { label: 'Note', icon: 'bi-card-text', color: '#6366f1' };
  if (t === 'link' || t.startsWith('http')) return { label: 'Link', icon: 'bi-link-45deg', color: '#06b6d4' };
  if (t.includes('pdf')) return { label: 'PDF', icon: 'bi-file-earmark-pdf', color: '#ef4444' };
  if (t.includes('word') || t.includes('document')) return { label: 'DOCX', icon: 'bi-file-earmark-word', color: '#3b82f6' };
  if (t.includes('presentation') || t.includes('powerpoint')) return { label: 'PPTX', icon: 'bi-file-earmark-slides', color: '#f97316' };
  if (t.includes('sheet') || t.includes('excel')) return { label: 'XLSX', icon: 'bi-file-earmark-excel', color: '#10b981' };
  if (t.includes('image') || t.includes('png') || t.includes('jpg')) return { label: 'Image', icon: 'bi-file-earmark-image', color: '#8b5cf6' };
  if (t.includes('zip') || t.includes('rar')) return { label: 'ZIP', icon: 'bi-file-earmark-zip', color: '#64748b' };
  return { label: (type.split('/').pop() || 'File').toUpperCase().slice(0, 6), icon: 'bi-file-earmark', color: '#94a3b8' };
};

const ContentCardMobile = ({ item, categoryMap, handleEditClick, handleDelete, isSelected, onToggleSelect, SITE_URL }) => {
  if (!item) return null;

  const { label, icon, color } = getTypeInfo(item.type);

  return (
    <div
      className={`glass-card mb-3 rounded-4 overflow-hidden transition-all w-100 text-start`}
      style={{
        boxShadow: isSelected ? `0 8px 20px ${color}15` : '0 2px 10px rgba(0,0,0,0.04)',
        border: '1px solid',
        borderColor: isSelected ? color : 'var(--glass-border)',
        borderLeft: `5px solid ${color}`,
        background: 'var(--surface-elevated, #fff)'
      }}
    >
      <div className="card-body p-3">
        {/* Top Header: Checkbox + Humanized Badge + Category */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              className="form-check-input m-0 cursor-pointer shadow-none"
              style={{ width: '20px', height: '20px', borderRadius: '6px', accentColor: color }}
              checked={isSelected}
              onChange={() => onToggleSelect(item._id)}
            />
            <span
              className="badge rounded-pill d-flex align-items-center gap-1 fw-bold"
              style={{ background: color + '12', color: color, border: `1px solid ${color}25`, fontSize: '0.65rem', padding: '4px 10px' }}
            >
              <i className={`bi ${icon}`}></i> {label}
            </span>
          </div>
          <span className="text-muted extra-small px-2 py-1 bg-light rounded-pill border" style={{ fontSize: '0.6rem' }}>
            {categoryMap[item.categoryId] || 'General'}
          </span>
        </div>

        {/* Title & Icon Section */}
        <div className="d-flex align-items-start gap-2 mb-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '32px', height: '32px', background: color + '10', color: color }}
          >
            <i className={`bi ${icon} fs-5`}></i>
          </div>
          <div className="fw-bold fs-6 mt-1" style={{ color: 'var(--text-primary)', lineHeight: '1.4', fontFamily: 'var(--font-display)' }}>
            {item.title}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="d-flex align-items-center gap-3 text-muted mb-3 ps-1" style={{ fontSize: '0.75rem' }}>
          <span title="Views"><i className="bi bi-eye me-1"></i>{item.viewsCount || 0}</span>
          <span title="Likes"><i className="bi bi-heart me-1"></i>{item.likesCount || 0}</span>
          <span title="Date" className="ms-auto"><i className="bi bi-calendar3 me-1"></i>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Bottom Actions: Organized Row */}
        <div className="d-flex gap-2 pt-3 border-top border-opacity-10">
          <a
            href={`${SITE_URL}/content/${item._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-info flex-grow-1 rounded-pill fw-bold shadow-none"
            style={{ fontSize: '0.75rem' }}
          >
            <i className="bi bi-eye me-1"></i> View
          </a>
          <button
            className="btn btn-sm btn-outline-warning flex-grow-1 rounded-pill fw-bold shadow-none"
            style={{ fontSize: '0.75rem' }}
            onClick={() => handleEditClick(item)}
          >
            <i className="bi bi-pencil-square me-1"></i> Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-none"
            style={{ width: '34px', height: '34px' }}
            onClick={() => handleDelete(item._id)}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPanel() {
  const { user } = useAuth();

  const { data: myContent = [], isLoading: loadingContent, refetch: refreshContent } = useMyContent();
  const { data: categoryMap = {} } = useCategoryMap();
  const { uploadContent, deleteContent, bulkDeleteContent } = useAdminContentMutation();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('note');
  const [files, setFiles] = useState(null);
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');

  // Category state
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('None Selected');

  const [uploadMode, setUploadMode] = useState('single');
  const [externalMimeType, setExternalMimeType] = useState('application/pdf');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusPhase, setStatusPhase] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

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

    if (type === 'file' && uploadMode === 'external') {
      formData.append('externalMimeType', externalMimeType);
    }

    if (type === 'file' && uploadMode !== 'external' && files && files.length > 0) {
      if (uploadMode === 'single' && files.length > 1) {
        setError('Please select only one file for Single Upload mode.');
        setUploading(false);
        return;
      }
      if (uploadMode === 'batch' && files.length > 10) {
        setError('Maximum 10 files allowed per batch for stability.');
        setUploading(false);
        return;
      }
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else if (type === 'link' || (type === 'file' && uploadMode === 'external')) {
      formData.append('link', link);
    } else if (type === 'note') {
      formData.append('textNote', note);
    }

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

      setTitle(''); setType('note'); setFiles(null); setLink(''); setNote(''); setTags('');
      setCategoryId(''); setCategoryName('None Selected');
      setExternalMimeType('application/pdf');
      setUploadProgress(0);
      refreshContent();
    } catch (err) {
      console.error("Upload Error Details:", err);
      const msg = err.response?.data?.message || err.message || 'Upload failed. Check server.';
      setError(msg);
      setUploadProgress(0);
    }
    setUploading(false);
  };

  // Delete Logic
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    deleteContent.mutate(id, {
      onSuccess: () => {
        setSelectedIds(prev => prev.filter(itemId => itemId !== id));
      }
    });
  };

  // Bulk Delete Logic
  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

    bulkDeleteContent.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setSuccess(`${selectedIds.length} items deleted successfully.`);
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Bulk delete failed.');
      }
    });
  };

  const filteredContent = myContent.filter(item => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const catName = categoryMap[item.categoryId] || 'Root / General';
    const catMatch = catName.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = item.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || catMatch || typeMatch;
  });

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

  // Edit Logic
  const handleEditClick = (item) => { setCurrentItem(item); setIsEditing(true); };
  const handleUpdateItem = () => {
    setSuccess('Content updated successfully!');
    setIsEditing(false);
  };



  return (
    <>
      <div className="container-fluid fade-in px-3 px-md-4 overflow-x-hidden" style={{ overflowX: 'hidden' }}>
        <div className="d-flex align-items-center mb-4">
          <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            <i className="bi bi-folder-check text-primary me-2"></i>Content Manager
          </h4>
        </div>

        {error && <div className="alert alert-danger border-0 shadow-sm" onClick={() => setError('')}>{error}</div>}
        {success && <div className="alert alert-success border-0 shadow-sm" onClick={() => setSuccess('')}>{success}</div>}

        <style dangerouslySetInnerHTML={{
          __html: `
            .stylish-search-group {
                background: var(--brand-50);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 4px 12px;
                transition: all 0.2s ease;
            }
            [data-bs-theme="dark"] .stylish-search-group {
                background: rgba(255, 255, 255, 0.03);
            }
            .stylish-search-group:focus-within {
                background: var(--surface-color);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
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
                color: var(--text-primary) !important;
            }
            .stylish-search-input::placeholder {
                color: #94a3b8;
                font-weight: 400;
            }
            .check-all-mobile-box {
                background: var(--brand-50);
                border: 1px solid var(--glass-border);
                border-radius: 10px;
                padding: 8px 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: background 0.2s;
            }
            [data-bs-theme="dark"] .check-all-mobile-box {
                background: rgba(255, 255, 255, 0.03);
            }
            .check-all-mobile-box:active {
                background: var(--brand-100);
            }
            .form-check-input {
                border: 2px solid var(--primary) !important;
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
            <div className="glass-card shadow-sm border-0 mb-4 overflow-hidden">
              <div className="card-body p-4 p-sm-4">
                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  <i className="bi bi-cloud-upload text-primary me-2"></i>Upload New Content
                </h5>

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
                  <div className="mb-4 p-3 rounded-3 border" style={{ backgroundColor: 'var(--surface-color, #f8fafc)', borderColor: 'var(--glass-border)' }}>
                    <label className="form-label fw-bold d-block mb-3 tracking-wider">Step 2: UPLOAD MODE</label>
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

                  <div className="mb-4">
                    <label className="form-label fw-bold">Step 3: Select Category</label>
                    <div className="p-3 border rounded-3 overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface-color, #f8fafc)', borderColor: 'var(--glass-border)' }}>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="small fw-semibold" style={{ color: 'var(--text-secondary, #64748b)' }}>Selected:</span>
                        <span
                          className="fw-bold px-3 py-1 rounded-pill"
                          style={{
                            backgroundColor: categoryId && categoryId !== '' ? 'var(--primary, #10b981)' : 'var(--glass-border, #e2e8f0)',
                            color: categoryId && categoryId !== '' ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em'
                          }}
                        >
                          {categoryName || 'None Selected'}
                        </span>
                      </div>
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
            <div className="card border-0 rounded-3 mb-4">
              <CategoryManager
                isSelectOnly={false}
              />
            </div>
          </div>
        </div>

        {/* Content Management Table */}
        <div className="row mt-4 mb-5 mx-0 gx-0">
          <div className="col-12">
            <div className="glass-card shadow-sm border-0 overflow-hidden">
              <div className="card-header border-0 bg-transparent px-3 pb-3">
                <div className="row g-3 align-items-center">
                  {/* Left Side: Title & Actions */}
                  <div className="col-12 col-md-6 ps-md-4">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
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
                    <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>Select All Content</span>
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
                  <div className="p-5 text-center text-muted">
                    <i className="bi bi-cloud-slash display-4 opacity-25"></i>
                    <p className="mt-2">You have not uploaded any content yet.</p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP VIEW: Table */}
                    <div className="table-responsive d-none d-lg-block">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr className="small text-uppercase text-muted">
                            <th style={{ width: '50px' }} className="ps-4">
                              <input
                                type="checkbox"
                                className="form-check-input border-2 border-primary"
                                checked={filteredContent.length > 0 && selectedIds.length === filteredContent.length}
                                onChange={toggleSelectAll}
                              />
                            </th>
                            <th>Title & Details</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th className="pe-4 text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContent.map(item => {
                            const { label, icon, color } = getTypeInfo(item.type);
                            return (
                              <tr key={item._id} className={selectedIds.includes(item._id) ? 'table-primary bg-opacity-10' : ''}>
                                <td className="ps-4">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => toggleSelect(item._id)}
                                    style={{ accentColor: color }}
                                  />
                                </td>
                                <td style={{ maxWidth: '300px' }}>
                                  <div className="d-flex align-items-center">
                                    <div
                                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                      style={{ width: '36px', height: '36px', background: color + '15', color: color }}
                                    >
                                      <i className={`bi ${icon} fs-5`}></i>
                                    </div>
                                    <div className="fw-bold text-dark text-truncate">{item.title}</div>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className="badge rounded-pill fw-bold"
                                    style={{ background: color + '12', color: color, border: `1px solid ${color}25`, fontSize: '0.7rem' }}
                                  >
                                    {label}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-muted small fw-medium">
                                    {categoryMap[item.categoryId] || 'Uncategorized'}
                                  </span>
                                </td>
                                <td className="pe-4 text-end">
                                  <div className="d-flex gap-1 justify-content-end">
                                    <a href={`${SITE_URL}/content/${item._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info rounded-circle border-0 shadow-none"><i className="bi bi-eye"></i></a>
                                    <button onClick={() => handleEditClick(item)} className="btn btn-sm btn-outline-warning rounded-circle border-0 shadow-none"><i className="bi bi-pencil-square"></i></button>
                                    <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-outline-danger rounded-circle border-0 shadow-none"><i className="bi bi-trash3"></i></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
                            typeInfo={getTypeInfo(item.type)} // Passing typeInfo to card
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
            categories={categoryMap}
          />
        )}
      </div>
    </>
  );
}
