import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Sahi import path
import api from '../services/api'; // Sahi import path
import { Link } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen'; // Sahi import path
import EditContentModal from '../components/EditContentModal'; // Sahi import path
import EditAnnouncementModal from '../components/EditAnnouncementModal'; // Sahi import path
import CategoryManager from '../components/CategoryManager'; // Sahi import path
// --- NAYA IMPORT ---
import DashboardLayout from '../components/DashboardLayout'; 
// -------------------

// --- 1. HELPER COMPONENT: Content Card for Mobile View ---
const ContentCardMobile = ({ item, categoryMap, handleEditClick, handleDelete }) => (
    <div className="card shadow-sm mb-3 border-0 rounded-lg">
        <div className="card-body">
            <div className="data-item fw-bold text-primary" data-label="Title">{item.title}</div>
            <div className="data-item" data-label="Category">
                {categoryMap[item.categoryId] || <span className='text-danger'>Unknown</span>}
            </div>
            <div className="data-item" data-label="Type">
                <span className="badge bg-secondary">{item.type}</span>
            </div>
            <div className="data-item" data-label="Views/Likes">
                {item.viewsCount} Views / {item.likesCount} Likes
            </div>
            <div className="card-actions">
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
  
  // --- NAYA STATE: Category Map ---
  const [categoryMap, setCategoryMap] = useState({});
  // ------------------------------
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for Content Management
  const [myContent, setMyContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
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
        const categoriesList = categoryData.categories || data;
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
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('categoryId', categoryId);
    formData.append('tags', tags);

    // --- BATCH UPLOAD LOGIC ---
    if (type === 'file' && files && files.length > 0) { 
      // Har file ko FormData mein 'files' field ke naam se append karein
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      formData.append('title', title || 'Batch Upload');
      
    } else if (type === 'link') { 
      formData.append('link', link); 
    } else if (type === 'note') { 
      formData.append('textNote', note); 
    }
    // --------------------------
    
    try {
      const { data } = await api.post('/content', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(data.message || 'Content uploaded successfully!');
      
      // Form reset karein
      setTitle(''); setType('note'); setFiles(null); setLink(''); setNote(''); setTags('');
      setCategoryId(''); setCategoryName('None Selected');
      fetchData(); // Sabkuch refresh karein
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check server.');
    }
    setUploading(false);
  };

  // Delete Logic
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      fetchData(); 
    } catch (err) {
      setError('Failed to delete content.');
    }
  };
  
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
        <h1 className="display-5 fw-bold mb-4 text-primary">Admin Panel</h1>

        {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
        {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

        <div className="row g-4">
          {/* Left Column: Upload Form */}
          <div className="col-lg-7">
            <div className="card shadow-lg border-0 rounded-3 mb-4">
              <div className="card-body p-4 p-sm-5">
                <h3 className="fw-bold mb-4 text-primary">Upload New Content</h3>
                <form onSubmit={handleUpload}>
                  {/* Title */}
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="title" placeholder="Content Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <label htmlFor="title">Content Title</label>
                  </div>
                  
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
                    <option value="file">File (PDF, PPT, DOCX, Video)</option>
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
                      <label htmlFor="files" className="form-label fw-bold">Upload File(s) (Max 20)</label>
                      {/* --- BATCH UPLOAD: multiple attribute add kiya gaya --- */}
                      <input 
                        type="file" 
                        className="form-control" 
                        id="files" 
                        onChange={handleFileChange} 
                        multiple 
                      />
                      {/* --- NAYA: Files ka count dikhayein --- */}
                      {files && files.length > 0 && (
                        <small className="text-success mt-1 d-block">
                          {files.length} file(s) selected for upload.
                        </small>
                      )}
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="tags" placeholder="e.g., IMP, Unit-1, Exam" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <label htmlFor="tags">Tags (comma se alag karein, e.g., IMP, Unit-1)</label>
                  </div>
                  
                  {/* Submit Button */}
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Content'}
                  </button>
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
          <div className="card-header">
            <h3 className="fw-bold mb-0">Manage Your Content</h3>
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
                        <th>Title</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myContent.map(item => (
                        <tr key={item._id}>
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