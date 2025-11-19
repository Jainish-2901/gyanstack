import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// FIX: Using standard relative paths consistent with other working pages
import api from '../services/api'; 
import LoadingScreen from '../components/LoadingScreen'; 
import { useAuth } from '../context/AuthContext'; 

// --- Helper Functions ---

const getYoutubeEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {}
  return null;
};

const getIcon = (type) => {
  if (!type) return 'bi-file-earmark-fill text-secondary';
  if (type.includes('pdf')) return 'bi-file-earmark-pdf-fill text-danger';
  if (type.includes('video') || type.includes('avi')) return 'bi-file-earmark-play-fill text-info';
  if (type.includes('image')) return 'bi-file-earmark-image-fill text-success';
  if (type.includes('doc') || type.includes('word')) return 'bi-file-earmark-word-fill text-primary';
  if (type.includes('ppt') || type.includes('presentation')) return 'bi-file-earmark-slides-fill text-warning';
  if (type.includes('xls') || type.includes('excel')) return 'bi-file-earmark-excel-fill text-success';
  if (type.includes('zip') || type.includes('archive') || type.includes('sifz')) return 'bi-file-earmark-zip-fill text-secondary';
  return 'bi-file-earmark-fill text-secondary';
};

const getDownloadUrl = (url, title) => {
  if (!url || !url.includes('/upload/')) return url;
  
  // FIX: Regex syntax issue fixed
  const unsafeCharsRegex = new RegExp(/[\\/\\?%*:|"<>]/g);
  const safeTitle = (title || 'download').replace(unsafeCharsRegex, '-').replace(/\s+/g, '_'); 
  
  return url.replace('/upload/', `/upload/fl_attachment:${safeTitle}/`);
};


// --- Detail Preview Component ---
const DetailPreview = ({ item }) => {
  const fileType = item.type || '';
  const resourceType = item.fileResourceType || 'raw';

  // 1. Text/Note Type
  if (fileType === 'note' || item.textNote) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h4 className="card-title text-muted mb-3">Note Content</h4>
          <p className="lead" style={{ whiteSpace: 'pre-wrap' }}>{item.textNote || 'No content.'}</p>
        </div>
      </div>
    );
  }

  // 2. Link Type
  if (fileType === 'link') {
    const embedUrl = getYoutubeEmbedUrl(item.url);
    if (embedUrl) {
      return (
        <div>
          <div className="ratio ratio-16x9 shadow-lg rounded">
            <iframe src={embedUrl} title={item.title} allowFullScreen></iframe>
          </div>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3">
            <i className="bi bi-youtube me-2"></i> Open on YouTube
          </a>
        </div>
      );
    }
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className="bi bi-link-45deg display-1 text-primary"></i>
        <h3 className='mt-3'>External Link</h3>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Open Link in New Tab</a>
      </div>
    );
  }

  // 3. Image Type
  if (resourceType === 'image' || fileType.includes('image')) {
    return (
      <div className="text-center">
        <img src={item.url} className="img-fluid rounded shadow-lg" alt={item.title} style={{ maxHeight: '80vh' }} />
      </div>
    );
  }

  // 4. Video Type
  if (resourceType === 'video' || fileType.includes('video') || fileType.includes('avi')) {
    return (
      <div>
        <div className="ratio ratio-16x9 shadow-lg rounded">
          <video controls autoPlay>
            <source src={item.url} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // 5. PDF Type
  if (fileType.includes('pdf')) {
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className="bi bi-file-earmark-pdf-fill display-1 text-danger"></i>
        <h3 className='mt-3 fw-bold'>{item.title}.pdf</h3>
        <p className="lead text-muted">This PDF must be opened in a new tab to view.</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3 me-2">
            <i className="bi bi-box-arrow-up-right me-2"></i> Open PDF
        </a>
      </div>
    );
  }
  
  // 6. Raw Files
  if (resourceType === 'raw') {
    const iconClass = getIcon(fileType);
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className={`bi ${iconClass} display-1`}></i>
        <h3 className='mt-3'>File Preview Not Available</h3>
        <p className="lead">This file ({fileType.split('/').pop() || 'File'}) must be downloaded to be viewed.</p>
      </div>
    );
  }

  return <p>Cannot preview this content type.</p>;
};


// --- Main Page Component ---
export default function ContentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0); 
  const [downloadsCount, setDownloadsCount] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/content/${id}`);
        setItem(data);
        setLikeCount(data.likesCount);
        setSavesCount(data.savesCount || 0);
        setDownloadsCount(data.downloadsCount || 0);

        if (user) {
          setIsLiked(data.likedBy.includes(user.id));
          setIsSaved(data.savedBy && data.savedBy.includes(user.id));
        }
      } catch (err) {
        console.error("Content fetch error:", err);
        setError('Content not found or failed to load.');
        setItem(null);
      }
      setLoading(false);
    };
    if (id) fetchContent();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { alert('Please log in to like content.'); return; }
    try {
      const { data } = await api.put(`/content/${id}/like`);
      setIsLiked(data.isLiked);
      setLikeCount(data.likesCount);
    } catch (err) { setError('Failed to update like status.'); }
  };
  
  const handleSave = async () => {
    if (!user) { alert('Please log in to save content.'); return; }
    try {
      const { data } = await api.put(`/content/${id}/save`);
      setIsSaved(data.isSaved);
      setSavesCount(data.savesCount);
    } catch (err) { setError('Failed to update save status.'); }
  };

  const handleDownload = async () => {
    if (!user) { alert('Please log in to download content.'); return; }
    try {
      const { data } = await api.put(`/content/${id}/download`);
      setDownloadsCount(data.downloadsCount); 
      
      const downloadUrl = getDownloadUrl(item.url, item.title);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.title); 
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Download tracking failed', err);
      window.open(getDownloadUrl(item.url, item.title), '_blank');
    }
  };

  const handleGoBack = () => { navigate(-1); };

  if (loading) return <LoadingScreen text="Loading content..." />;

  if (!item) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger">Content Not Found</h2>
        <p className='lead'>The requested resource could not be loaded or does not exist.</p>
        <Link to="/" className="btn btn-primary mt-3">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">

          <button onClick={handleGoBack} className="btn btn-outline-secondary mb-3">
            <i className="bi bi-arrow-left me-2"></i> Go Back
          </button>

          <h1 className="display-4 fw-bold mb-3">{item.title}</h1>
          
          <div className="d-flex flex-wrap align-items-center text-muted mb-4">
            <span className="me-3"><i className="bi bi-person-fill me-1"></i> Uploaded by: {item.uploadedBy?.username || 'Admin'}</span>
            <span className="me-3"><i className="bi bi-eye-fill me-1"></i> {item.viewsCount} Views</span>
            <span className="me-3"><i className="bi bi-heart-fill me-1"></i> {likeCount} Likes</span>
            <span className="me-3"><i className="bi bi-download me-1"></i> {downloadsCount} Downloads</span>
            <span className="me-3"><i className="bi bi-calendar-event me-1"></i> On: {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="mb-4">
            {item.tags?.map(tag => (
              <span key={tag} className="badge bg-secondary me-1 fs-6">{tag}</span>
            ))}
          </div>

          <div className="mb-4">
            <DetailPreview item={item} />
          </div>
          
          <div className="d-flex gap-3 mb-5">
            <button className={`btn btn-lg ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={handleLike} disabled={!user}>
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i> {isLiked ? ' Liked' : ' Like'}
            </button>
            
            <button className={`btn btn-lg ${isSaved ? 'btn-success' : 'btn-outline-success'}`} onClick={handleSave} disabled={!user}>
              <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i> {isSaved ? ' Saved' : ' Save'}
            </button>
            
            {/* Download Button for all supported types */}
            {(item.fileResourceType === 'image' || (item.type && item.type.includes('image')) ||
              item.fileResourceType === 'video' || (item.type && item.type.includes('video')) || (item.type && item.type.includes('avi')) ||
              item.fileResourceType === 'raw' || (item.type && item.type.includes('pdf'))) && (
                
                <button onClick={handleDownload} className="btn btn-lg btn-info" disabled={!user}>
                  <i className="bi bi-download me-2"></i> Download
                </button>
              )}
          </div>

        </div>
      </div>
    </div>
  );
}
