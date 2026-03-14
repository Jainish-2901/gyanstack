import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Sahi import path
import api from '../../services/api'; // Sahi import path
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen'; // Sahi import path
import EditContentModal from '../../components/EditContentModal'; // Sahi import path
import EditAnnouncementModal from '../../components/EditAnnouncementModal'; // Sahi import path
import CategoryManager from '../../components/CategoryManager'; // Sahi import path
// --- NAYA IMPORT ---
import DashboardLayout from '../../components/DashboardLayout'; 
// -------------------

// --- 1. HELPER COMPONENT: Content Card for Mobile View ---
const ContentCardMobile = ({ item, categoryMap, handleEditClick, handleDelete, isSelected, onToggleSelect }) => (
    <div className={`card shadow-sm mb-3 border-0 rounded-lg ${isSelected ? 'border-primary shadow' : ''}`} style={isSelected ? {borderWidth: '2px', borderStyle: 'solid'} : {}}>
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="data-item fw-bold text-primary" data-label="Title">{item.title}</div>
                <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item._id)}
                />
            </div>
            <div className="data-item" data-label="Category">
                {categoryMap[item.categoryId] || <span className='text-danger'>Unknown</span>}
            </div>
            <div className="data-item" data-label="Type">
                <span className="badge bg-secondary">{item.type}</span>
            </div>
            <div className="data-item" data-label="Views/Likes">
                {item.viewsCount} Views / {item.likesCount} Likes
            </div>
            <div className="card-actions mt-2">
                <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEditClick(item)} 
                >
                    Edit
                </button>
                <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item._id)}
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

// --- 2. HELPER COMPONENT: Announcement Card for Mobile View ---
const AnnouncementCardMobile = ({ item, handleAnnEditClick, handleAnnouncementDelete }) => (
    <div className="card shadow-sm mb-3 border-0 rounded-lg">
        <div className="card-body">
            <div className="data-item fw-bold" data-label="Title">{item.title}</div>
            <div className="data-item" data-label="Status">
                <span className={`badge ${
                    item.status === 'approved' ? 'bg-success' :
                    item.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                }`}>{item.status}</span>
            </div>
            <div className="data-item" data-label="Date">
                {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="card-actions">
                <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleAnnEditClick(item)}
                    disabled={item.status !== 'pending'} 
                >
                    Edit
                </button>
                <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleAnnouncementDelete(item._id)}
                >
                    Delete
                </button>
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
  
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'batch'
  
  // --- NAYA STATE: Category Map ---
  const [categoryMap, setCategoryMap] = useState({});
  // ------------------------------
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // For progress bar
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for Content Management
  const [myContent, setMyContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // --- NAYA STATE: Bulk Selection ---
  const [selectedIds, setSelectedIds] = useState([]);
  // ----------------------------------
  
  // States for Announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);

  // Fetch content, announcements, AND categories
  const fetchData = async () => {
    setLoadingContent(true);
    setLoadingAnn(true);
    
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
    
    try {
      const { data: annData } = await api.get('/announcements/my-requests'); 
      setMyAnnouncements(annData.announcements);
    } catch (err) {
      setError('Failed to fetch your announcements.');
    }
    setLoadingAnn(false);
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
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('categoryId', categoryId);
    formData.append('tags', tags);

    // --- BATCH UPLOAD LOGIC ---
    if (type === 'file' && files && files.length > 0) { 
      // Single mode validation
      if (uploadMode === 'single' && files.length > 1) {
        setError('Please select only one file for Single Upload mode.');
        setUploading(false);
        return;
      }
      
      // Har file ko FormData mein 'files' field ke naam se append karein
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else if (type === 'link') { 
      formData.append('link', link); 
    } else if (type === 'note') { 
      formData.append('textNote', note); 
    }
    // --------------------------
    
    try {
      const { data } = await api.post('/content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setSuccess(data.message || 'Content uploaded successfully!');
      
      // Form reset karein
      setTitle(''); setType('note'); setFiles(null); setLink(''); setNote(''); setTags('');
      setCategoryId(''); setCategoryName('None Selected');
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

  const toggleSelectAll = () => {
    if (selectedIds.length === myContent.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(myContent.map(item => item._id));
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
  
  // Announcement Logic
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/announcements/request', { title: annTitle, content: annContent });
      setSuccess('Announcement request submitted to Super Admin for approval!');
      setAnnTitle('');
      setAnnContent('');
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit announcement.');
    }
    setAnnLoading(false);
  };
  
  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setSuccess('Announcement request deleted.');
      fetchData(); 
    } catch (err) {
      setError('Failed to delete announcement request.');
    }
  };

  const handleAnnEditClick = (announcement) => {
    setCurrentAnn(announcement);
    setIsEditingAnn(true);
  };
  
  const handleUpdateAnn = (updatedItem) => {
    setMyAnnouncements(myAnnouncements.map(ann => 
      ann._id === updatedItem._id ? updatedItem : ann
    ));
    setSuccess('Announcement request updated successfully!');
  };


  return (
    // --- DASHBOARD LAYOUT MEIN WRAP KAREIN ---
    <DashboardLayout>
      <div className="container-fluid fade-in">
        <h3 className="fw-bold mb-4 text-primary">Admin Panel</h3>

        {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
        {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

        <div className="row g-4">
          {/* Left Column: Upload Form */}
          <div className="col-lg-7">
            <div className="card shadow-lg border-0 rounded-3 mb-4">
              <div className="card-body p-4 p-sm-5">
                  <h3 className="fw-bold mb-4 text-primary">Upload New Content</h3>
                  
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
                          <i className="bi bi-files me-2"></i>Batch Upload (Multiple)
                        </label>
                      </div>
                      <small className="text-muted mt-2 d-block">
                        {uploadMode === 'single' 
                          ? 'Upload one file with a custom title.' 
                          : 'Upload multiple files. Titles will be auto-generated from filenames.'}
                      </small>
                    </div>
                  )}

                  <hr className="my-4 opacity-10" />

                  <form onSubmit={handleUpload}>
                    {/* Title (Only for Single/Note/Link) */}
                    {(type !== 'file' || uploadMode === 'single') && (
                      <div className="form-floating mb-3">
                        <input type="text" className="form-control" id="title" placeholder="Content Title" value={title} onChange={(e) => setTitle(e.target.value)} required={uploadMode === 'single' || type !== 'file'} />
                        <label htmlFor="title">Content Title</label>
                      </div>
                    )}
                  
                  {/* --- NAYA CATEGORY SELECTOR --- */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Category:</label>
                    <div className="p-3 border rounded">
                      <p>Selected: <span className="fw-bold text-primary">{categoryName}</span></p>
                      <CategoryManager 
                        onSelectCategory={(id, name) => {
                          setCategoryId(id);
                          setCategoryName(name);
                        }} 
                        isSelectOnly={true} // Isse add/edit buttons hide ho jayenge
                      />
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
                      <label htmlFor="files" className="form-label fw-bold">
                        {uploadMode === 'single' ? 'Step 4: Select Single File' : 'Step 4: Select Multiple Files'}
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="files" 
                        onChange={handleFileChange} 
                        multiple={uploadMode === 'batch'} 
                        required
                      />
                      {files && files.length > 0 && (
                        <div className="mt-2 p-3 bg-light rounded border border-success border-opacity-25 overflow-auto" style={{maxHeight: '150px'}}>
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
                          <span>{uploadProgress < 100 ? 'Uploading to Server...' : 'Processing on Cloud...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar progress-bar-striped progress-bar-animated ${uploadProgress === 100 ? 'bg-success' : 'bg-primary'}`} 
                            role="progressbar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
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
          <div className="col-lg-5">
            {/* Naya Category Manager (Admin bhi manage kar sakta hai) */}
            <div className="card shadow-lg border-0 rounded-3 mb-4">
              <CategoryManager 
                isSelectOnly={false} // Yahaan poori functionality (add/edit/delete/reorder) dikhegi
              />
            </div>

            {/* Request Announcement Form */}
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-4 p-sm-5">
                <h3 className="fw-bold mb-4 text-primary">Request Announcement</h3>
                <p>Home page par dikhane ke liye nayi update submit karein.</p>
                <form onSubmit={handleAnnouncementSubmit}>
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="annTitle" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                    <label htmlFor="annTitle">Title</label>
                  </div>
                  <div className="form-floating mb-3">
                    <textarea className="form-control" id="annContent" placeholder="Content..." style={{ height: '100px' }} value={annContent} onChange={(e) => setAnnContent(e.target.value)} required></textarea>
                    <label htmlFor="annContent">Content</label>
                  </div>
                  <button type="submit" className="btn btn-info w-100" disabled={annLoading}>
                    {annLoading ? 'Requesting...' : 'Request for Approval'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Management Table */}
        <div className="card shadow-lg border-0 rounded-3 mt-4">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h3 className="fw-bold mb-0">Manage Your Content</h3>
              
              {!loadingContent && myContent.length > 0 && (
                <div className="ms-md-3 d-flex flex-wrap gap-2">
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 py-2 px-3 small">
                    <i className="bi bi-layers-fill me-1"></i>
                    {myContent.length} Total
                  </span>
                  
                  {/* Notes Count */}
                  {myContent.filter(c => c.type === 'note').length > 0 && (
                    <span className="badge rounded-pill bg-info bg-opacity-10 text-info border border-info border-opacity-10 py-2 px-3 small">
                      <i className="bi bi-card-text me-1"></i>
                      {myContent.filter(c => c.type === 'note').length} Notes
                    </span>
                  )}
                  
                  {/* Links Count */}
                  {myContent.filter(c => c.type === 'link').length > 0 && (
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 py-2 px-3 small">
                      <i className="bi bi-link-45deg me-1"></i>
                      {myContent.filter(c => c.type === 'link').length} Links
                    </span>
                  )}
                  
                  {/* Files Count */}
                  {myContent.filter(c => c.type !== 'note' && c.type !== 'link').length > 0 && (
                    <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10 py-2 px-3 small">
                      <i className="bi bi-file-earmark-arrow-up me-1"></i>
                      {myContent.filter(c => c.type !== 'note' && c.type !== 'link').length} Files
                    </span>
                  )}
                </div>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button className="btn btn-danger btn-sm shadow-sm animate-pulse" onClick={handleBulkDelete}>
                <i className="bi bi-trash-fill me-1"></i>
                Delete Selected ({selectedIds.length})
              </button>
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
                            checked={myContent.length > 0 && selectedIds.length === myContent.length}
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
                      {myContent.map(item => (
                        <tr key={item._id} className={selectedIds.includes(item._id) ? 'table-primary' : ''}>
                          <td>
                            <input 
                              type="checkbox" 
                              className="form-check-input"
                              checked={selectedIds.includes(item._id)}
                              onChange={() => toggleSelect(item._id)}
                            />
                          </td>
                          <td>{item.title}</td>
                          <td><span className="badge bg-secondary">{item.type}</span></td>
                          
                          <td>
                            {categoryMap[item.categoryId] || <span className='text-danger'>Unknown</span>}
                          </td>

                          <td>
                            <button 
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEditClick(item)} 
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* MOBILE VIEW: Cards */}
                <div className="d-lg-none p-3">
                  {myContent.map(item => (
                    <ContentCardMobile 
                        key={item._id} 
                        item={item} 
                        categoryMap={categoryMap}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                        isSelected={selectedIds.includes(item._id)}
                        onToggleSelect={toggleSelect}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* My Announcement Requests Table */}
        <div className="card shadow-lg border-0 rounded-3 mt-4">
          <div className="card-header">
            <h3 className="fw-bold mb-0">My Announcement Requests</h3>
          </div>
          <div className="card-body p-0 responsive-card-view">
            {loadingAnn ? (
              <LoadingScreen text="Loading your requests..." />
            ) : myAnnouncements.length === 0 ? (
              <p className='p-3'>You have not requested any announcements yet.</p>
            ) : (
              <>
                {/* DESKTOP VIEW: Table */}
                <div className="table-responsive d-none d-lg-block">
                  <table className="table table-striped table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAnnouncements.map(item => (
                        <tr key={item._id}>
                          <td>{item.title}</td>
                          <td>
                            <span className={`badge ${
                              item.status === 'approved' ? 'bg-success' :
                              item.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                            }`}>{item.status}</span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleAnnEditClick(item)}
                              disabled={item.status !== 'pending'} 
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleAnnouncementDelete(item._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* MOBILE VIEW: Cards */}
                <div className="d-lg-none p-3">
                    {myAnnouncements.map(item => (
                        <AnnouncementCardMobile 
                            key={item._id} 
                            item={item}
                            handleAnnEditClick={handleAnnEditClick}
                            handleAnnouncementDelete={handleAnnouncementDelete}
                        />
                    ))}
                </div>
              </>
            )}
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
        
        {isEditingAnn && currentAnn && (
          <EditAnnouncementModal
            item={currentAnn}
            onClose={() => setIsEditingAnn(false)}
            onUpdate={handleUpdateAnn}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
