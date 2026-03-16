import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// --- FIX: Sahi import paths (bina .js/.jsx) ---
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import ShareButton from '../../components/ShareButton';
import ContentCard from '../../components/ContentCard';
import NotFound from './NotFound';
// ---------------------------------------------

// --- Helper Functions ---

const cleanTitle = (title) => {
  if (!title) return '';
  const parts = title.split(/[,\-]+/).map(p => p.trim()).filter(p => p);
  const unique = [...new Set(parts)];
  return unique.length === 1 ? unique[0] : title;
};

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
  } catch {
    // URL parse fail hui
  }
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

const getDownloadUrl = (item) => {
  const { url, title, googleDriveId } = item;
  if (!url) return '#';

  // 1. Google Drive URL handled specifically
  if (googleDriveId) {
    return `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
  }

  // 2. Legacy Cloudinary Logic
  if (url.includes('/upload/')) {
    const baseTitle = cleanTitle(title) || 'download';
    const safeName = baseTitle.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`);
  }

  return url;
};


// --- Detail Preview Component ---
const DetailPreview = ({ item }) => {
  const fileType = item.type || '';
  const resourceType = item.fileResourceType || 'raw';

  // 0. Google Drive Preview logic (Responsive)
  if (item.googleDriveId) {
    const previewUrl = `https://drive.google.com/file/d/${item.googleDriveId}/preview`;
    return (
      <div className="shadow-sm rounded overflow-hidden">
        <div className="ratio ratio-4x3" style={{ minHeight: '300px', maxHeight: '70vh' }}>
          <iframe 
            src={previewUrl} 
            title={item.title} 
            allow="autoplay; encrypted-media" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }

  // 1. Text/Note Type
  if (fileType === 'note' || item.textNote) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body p-3 p-md-4">
          <h5 className="text-secondary fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-file-text me-2"></i>Note Content
          </h5>
          <div className="content-text" style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.6' }}>
            {item.textNote || 'No content.'}
          </div>
        </div>
      </div>
    );
  }

  // 2. Link Type
  if (fileType === 'link') {
    const embedUrl = getYoutubeEmbedUrl(item.url);
    if (embedUrl) {
      return (
        <div className="text-center">
          <div className="ratio ratio-16x9 shadow rounded bg-dark">
            <iframe
              src={embedUrl}
              title={item.title || "YouTube video player"}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <div className="mt-3">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger btn-sm">
              <i className="bi bi-youtube me-2"></i> Watch on YouTube
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center p-4 p-md-5 bg-light rounded shadow-sm border">
        <i className="bi bi-link-45deg display-3 text-primary mb-3 d-block"></i>
        <h4 className='fw-bold mb-3'>External Resource</h4>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-4 rounded-pill">Open Link</a>
      </div>
    );
  }

  // 3. Image Type
  if (resourceType === 'image' || fileType.includes('image')) {
    return (
      <div className="text-center bg-light p-2 rounded">
        <img src={item.url} className="img-fluid rounded shadow" alt={item.title} style={{ maxHeight: '75vh' }} />
      </div>
    );
  }

  // 4. Video Type
  if (resourceType === 'video' || fileType.includes('video') || fileType.includes('avi')) {
    return (
      <div className="shadow rounded bg-dark overflow-hidden">
        <div className="ratio ratio-16x9">
          <video controls className="w-100">
            <source src={item.url} type={item.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // 5. PDF Type
  if (fileType.includes('pdf')) {
    return (
      <div className="shadow-sm rounded overflow-hidden border">
        <div className="ratio ratio-4x3" style={{ minHeight: '400px', maxHeight: '80vh' }}>
          <iframe
            src={item.url}
            title={item.title || "PDF document"}
            allow="fullscreen"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    );
  }

  // 6. Fallback (DOCX, ZIP, etc.)
  if (item.url && fileType !== 'note' && fileType !== 'link') {
    const iconClass = getIcon(item.type);
    return (
      <div className="text-center p-4 p-md-5 glass-panel border shadow-sm">
        <div className="mb-4">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4">
            <i className={`bi ${iconClass} display-4`}></i>
          </div>
        </div>
        <h4 className='fw-bold mb-2'>{cleanTitle(item.title)}</h4>
        <div className="alert alert-info d-inline-block px-4 mb-0 rounded-pill small">
          <i className="bi bi-info-circle me-2"></i> Ready for download
        </div>
      </div>
    );
  }

  return (
    <div className="alert alert-warning text-center rounded-3">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      Preview not available.
    </div>
  );
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
  const [relatedItems, setRelatedItems] = useState([]);

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
        
        // --- Fetch Related Items ---
        try {
          const relRes = await api.get(`/content?category=${data.categoryId}`);
          // Filter out current item and limit to 4
          const filtered = relRes.data.content
            .filter(i => i._id !== id)
            .slice(0, 4);
          setRelatedItems(filtered);
        } catch (relErr) {
          console.error("Related fetch error:", relErr);
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

      const downloadUrl = getDownloadUrl(item);

      // Trigger download using a temporary hidden link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.title || 'download');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Download logic error', err);
      // Clean fallback
      window.open(item.url, '_blank');
    }
  };

  const handleGoBack = () => { navigate(-1); };

  if (loading) return <LoadingScreen text="Loading content..." />;

  if (!item) {
    return <NotFound />;
  }

  return (
    <div className="container my-4 my-md-5 mx-auto fade-in">
      <div className="row justify-content-center">
        <div className="col-12">

          <button onClick={handleGoBack} className="btn btn-outline-secondary mb-4 shadow-sm btn-sm px-3">
            <i className="bi bi-arrow-left me-2"></i> Go Back
          </button>

          <header className="mb-4">
            <h1 className="fw-bold mb-3 text-break fs-2 fs-md-1 lh-sm">{cleanTitle(item.title)}</h1>
            
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mb-3">
              <div className="bg-light px-3 py-1 rounded-pill d-flex align-items-center">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                <span>By: </span>
                <Link to={`/uploader/${item.uploadedBy?._id}`} className="ms-1 text-primary text-decoration-none fw-bold">
                  {item.uploadedBy?.username || 'Admin'}
                </Link>
              </div>
              <div className="bg-light px-3 py-1 rounded-pill">
                <i className="bi bi-calendar-check me-2"></i>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-2">
              <div className="d-flex align-items-center"><i className="bi bi-eye-fill me-2 text-info"></i>{item.viewsCount} Views</div>
              <div className="d-flex align-items-center"><i className="bi bi-heart-fill me-2 text-danger"></i>{likeCount} Likes</div>
              <div className="d-flex align-items-center"><i className="bi bi-cloud-download-fill me-2 text-success"></i>{downloadsCount} Downloads</div>
            </div>
          </header>

          <div className="mb-4 d-flex flex-wrap gap-2">
            {item.tags?.map(tag => (
              <span key={tag} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-medium">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mb-4 glass-panel overflow-hidden shadow-sm">
            <DetailPreview item={item} />
          </div>

          {/* Action Buttons Section */}
          <div className="row g-3 mb-5">
            <div className="col-12 col-sm-6 col-md-3">
              <button
                className={`btn w-100 py-3 d-flex align-items-center justify-content-center h-100 ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleLike}
                disabled={!user}
              >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} fs-5 me-2`}></i>
                {isLiked ? 'Liked' : 'Like'}
              </button>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <button
                className={`btn w-100 py-3 d-flex align-items-center justify-content-center h-100 ${isSaved ? 'btn-success' : 'btn-outline-success'}`}
                onClick={handleSave}
                disabled={!user}
              >
                <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} fs-5 me-2`}></i>
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

             <div className="col-12 col-sm-6 col-md-3">
              <ShareButton 
                title={item.title} 
                url={window.location.href} 
                className="btn btn-outline-primary w-100 py-3 d-flex align-items-center justify-content-center h-100"
              />
            </div>

            {item.url && item.type !== 'note' && item.type !== 'link' && (
              <div className="col-12 col-md-3">
                <button
                  onClick={handleDownload}
                  className="btn btn-info w-100 py-3 shadow-sm rounded-pill fw-bold text-white d-flex align-items-center justify-content-center"
                >
                  <i className="bi bi-cloud-arrow-down-fill me-2 fs-4"></i>
                  Download
                </button>
              </div>
            )}
          </div>

          {/* RELATED RESOURCES SECTION */}
          {relatedItems.length > 0 && (
            <section className="mt-5 pt-5 border-top">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <i className="bi bi-collection-fill text-primary fs-4"></i>
                </div>
                <h3 className="fw-bold mb-0">Recommended for You</h3>
              </div>
              <div className="row g-3 g-md-4">
                {relatedItems.map(rel => (
                  <div key={rel._id} className="col-6 col-md-4 col-lg-3">
                    <ContentCard item={rel} />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
