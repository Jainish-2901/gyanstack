import React, { useState, useEffect } from 'react';
// --- CHANGE: 'useNavigate' ko import karein ---
import { useParams, Link, useNavigate } from 'react-router-dom';
// --- FIX: Sahi import paths (bina .js/.jsx) ---
import api from '../services/api'; 
import LoadingScreen from '../components/LoadingScreen'; 
import { useAuth } from '../context/AuthContext'; 
// ---------------------------------------------

// --- Helper Functions (ContentCard se copy kiye gaye) ---

/**
 * YouTube URL ko embeddable URL me convert karta hai
 */
const getYoutubeEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (e) {}
  return null;
};

/**
 * File type ke hisaab se icon return karta hai
 */
const getIcon = (type) => {
  if (type.includes('pdf')) return 'bi-file-earmark-pdf-fill text-danger';
  if (type.includes('video')) return 'bi-file-earmark-play-fill text-info';
  if (type.includes('image')) return 'bi-file-earmark-image-fill text-success';
  if (type.includes('doc') || type.includes('word')) return 'bi-file-earmark-word-fill text-primary';
  if (type.includes('ppt') || type.includes('presentation')) return 'bi-file-earmark-slides-fill text-warning';
  if (type.includes('xls') || type.includes('excel')) return 'bi-file-earmark-excel-fill text-success';
  if (type.includes('zip') || type.includes('archive')) return 'bi-file-earmark-zip-fill text-secondary';
  return 'bi-file-earmark-fill text-secondary';
};

/**
 * Cloudinary URL ko force-download URL me convert karta hai
 */
const getDownloadUrl = (url, title) => {
  if (!url || !url.includes('/upload/')) {
    // Agar ye Cloudinary URL nahi hai, to waisa hi return karein
    return url;
  }
  
  // Title ko URL-friendly banayein (unsafe characters hatayein, spaces ko '-' se badlein)
  // --- FIX: Regex ko new RegExp constructor se banaya gaya hai taaki syntax error na ho ---
  const unsafeCharsRegex = new RegExp(/[\\/\\?%*:|"<>]/g);
  const safeTitle = (title || 'download')
    .replace(unsafeCharsRegex, '-') // Unsafe characters
    .replace(/\s+/g, '_'); // Spaces ko underscore se badlein
  
  // fl_attachment ke saath title set karein
  // Format: /upload/fl_attachment:FILENAME/v123...
  return url.replace('/upload/', `/upload/fl_attachment:${safeTitle}/`);
};


// --- Detail Preview Component ---
// Ye component full page preview render karega

const DetailPreview = ({ item }) => {
  
  // 1. Text/Note Type
  if (item.type === 'note' || item.textNote) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h4 className="card-title text-muted mb-3">Note Content</h4>
          {/* 'pre-wrap' zaroori hai taaki formatting (jaise new lines) bani rahe */}
          <p className="lead" style={{ whiteSpace: 'pre-wrap' }}>
            {item.textNote || 'No content.'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Link Type (YouTube ya Normal Link)
  if (item.type === 'link') {
    const embedUrl = getYoutubeEmbedUrl(item.url);
    if (embedUrl) {
      // YouTube Video
      return (
        // --- Button yahaan rahega (Kyunki ye 'Open' hai, 'Download' nahi) ---
        <div>
          <div className="ratio ratio-16x9 shadow-lg rounded">
            <iframe
              src={embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3">
            <i className="bi bi-youtube me-2"></i>
            Open on YouTube
          </a>
        </div>
      );
    }
    // Normal Link
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className="bi bi-link-45deg display-1 text-primary"></i>
        <h3 className='mt-3'>External Link</h3>
        <p className="lead">Ye content ek doosri website par hai.</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
          Open Link in New Tab
        </a>
      </div>
    );
  }

  // --- CHANGE: Ab hum 'type' (mimetype) ko bhi check karenge ---

  // 3. Image Type
  if (item.fileResourceType === 'image' || item.type.includes('image')) {
    return (
      <div className="text-center">
        <img src={item.url} className="img-fluid rounded shadow-lg" alt={item.title} style={{ maxHeight: '80vh' }} />
        {/* --- BUTTON YAHAN SE HATA DIYA GAYA HAI --- */}
      </div>
    );
  }

  // 4. Video Type
  if (item.fileResourceType === 'video' || item.type.includes('video')) {
    return (
      <div>
        <div className="ratio ratio-16x9 shadow-lg rounded">
          <video controls autoPlay>
            <source src={item.url} type={item.type} />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* --- BUTTON YAHAN SE HATA DIYA GAYA HAI --- */}
      </div>
    );
  }

  // 5. PDF Type (Icon Box Fix)
  if (item.type.includes('pdf')) {
    const fileName = `${item.title}.pdf`;
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className="bi bi-file-earmark-pdf-fill display-1 text-danger"></i>
        <h3 className='mt-3 fw-bold'>{fileName}</h3>
        <p className="lead text-muted">This PDF must be opened in a new tab to view.</p>
        
        {/* NAYA BUTTON: Open PDF */}
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger mt-3 me-2">
            <i className="bi bi-box-arrow-up-right me-2"></i> Open PDF
        </a>
      </div>
    );
  }
  
  // 6. 'Raw' File Type (PPT, ZIP, etc.)
  // Agar 'raw' hai, lekin 'link', 'note', 'image', 'video', 'pdf' nahi hai
  if (item.fileResourceType === 'raw') {
    const iconClass = getIcon(item.type);
    return (
      <div className="text-center p-5 bg-light rounded shadow-sm">
        <i className={`bi ${iconClass} display-1`}></i>
        <h3 className='mt-3'>File (Raw)</h3>
        <p className="lead">Is file ko preview nahi kiya ja sakta.</p>
        {/* --- BUTTON YAHAN SE HATA DIYA GAYA HAI --- */}
      </div>
    );
  }

  // Fallback
  return <p>Cannot preview this content type.</p>;
};


// --- Main Page Component ---
export default function ContentDetailPage() {
  const { id } = useParams(); // URL se /content/:id waala 'id' lein
  const { user } = useAuth(); // Logged-in user ki details
  const navigate = useNavigate(); // --- NAYA: Back button ke liye ---
  
  const [item, setItem] =useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- Like/Save State ---
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // --- CHANGE: Save state add karein ---
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0); // (Abhi display nahi kar rahe)
  // ----------------------------------

  // Data Fetching Effect
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/content/${id}`);
        setItem(data);
        
        // Like status set karein
        setLikeCount(data.likesCount);
        if (user && data.likedBy.includes(user.id)) {
          setIsLiked(true);
        }
        
        // --- CHANGE: Save status set karein ---
        setSavesCount(data.savesCount || 0);
        if (user && data.savedBy && data.savedBy.includes(user.id)) {
          setIsSaved(true);
        }
        // ------------------------------------
        
      } catch (err) {
        setError('Content not found or failed to load.');
      }
      setLoading(false);
    };
    
    if (id) {
      fetchContent();
    }
  }, [id, user]); // 'user' ko dependency me add karein

  // --- Like Button Function ---
  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like content.'); // Ya modal dikhayein
      return;
    }
    
    try {
      // API ko call karein (backend me 'likeContent' function)
      const { data } = await api.put(`/content/${id}/like`);
      
      // State ko turant update karein
      setIsLiked(data.isLiked);
      setLikeCount(data.likesCount);
      
    } catch (err) {
      setError('Failed to update like status.');
    }
  };
  
  // --- Save Button Function (UPDATED) ---
  const handleSave = async () => {
    if (!user) {
      alert('Please log in to save content.');
      return;
    }
    
    try {
      // Nayi API '/:id/save' ko call karein
      const { data } = await api.put(`/content/${id}/save`);
      
      // State ko turant update karein
      setIsSaved(data.isSaved);
      setSavesCount(data.savesCount);
      
    } catch (err) {
      setError('Failed to update save status.');
    }
  };
  // -------------------------------------

  // --- NAYA FUNCTION: Back Button ---
  const handleGoBack = () => {
    navigate(-1); // History me ek page piche jaao
  };
  // ---------------------------------

  // --- NAYA FUNCTION (DOWNLOAD TRACKING) ---
  const handleDownload = async () => {
    if (!user) {
      alert('Please log in to download content.');
      return;
    }
    
    try {
      // 1. Pehle API ko call karke count badhayein
      // Humein response ka wait karne ki zaroorat nahi hai (fire and forget)
      api.put(`/content/${id}/download`);
      
      // 2. File ko programmatically download karein
      const downloadUrl = getDownloadUrl(item.url, item.title);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', item.title); // Fallback filename
      link.setAttribute('target', '_blank'); // Naye tab me khole (fallback)
      link.setAttribute('rel', 'noopener noreferrer');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Download tracking failed', err);
      // Agar tracking fail ho, tab bhi download link khol dein
      const downloadUrl = getDownloadUrl(item.url, item.title);
      window.open(downloadUrl, '_blank');
    }
  };
  // ---------------------------------------


  if (loading) {
    return <LoadingScreen text="Loading content..." />;
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <h2 className="text-danger">{error}</h2>
        <Link to="/" className="btn btn-primary mt-3">Go Back Home</Link>

      </div>
    );
  }

  if (!item) {
    return null; // Agar item null hai (loading ke baad bhi)
  }

  return (
    <div className="container my-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">

          {/* --- NAYA BACK BUTTON --- */}
          <button onClick={handleGoBack} className="btn btn-outline-secondary mb-3">
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </button>
          {/* ------------------------ */}

          {/* 1. Title */}
          <h1 className="display-4 fw-bold mb-3">{item.title}</h1>
          
          {/* 2. Meta Info (Uploader, Stats) */}
          <div className="d-flex flex-wrap align-items-center text-muted mb-4">
            <span className="me-3">
              <i className="bi bi-person-fill me-1"></i> 
              Uploaded by: {item.uploadedBy?.username || 'Admin'}
            </span>
            <span className="me-3">
              <i className="bi bi-eye-fill me-1"></i> 
              {item.viewsCount} Views
            </span>
            <span className="me-3">
              <i className="bi bi-heart-fill me-1"></i> 
              {likeCount} Likes
            </span>
            <span className="me-3">
              <i className="bi bi-calendar-event me-1"></i> 
              On: {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {/* 3. Tags */}
          <div className="mb-4">
            {item.tags?.map(tag => (
              <span key={tag} className="badge bg-secondary me-1 fs-6">{tag}</span>
            ))}
          </div>

          {/* 4. Main Preview Component */}
          <div className="mb-4">
            {/* --- YEH LINE MISSING THI --- */}
            <DetailPreview item={item} />
          </div>
          {/* --- YEH CLOSING TAG MISSING THA --- */}
          
          {/* 5. Action Buttons (Like, Save & Download) */}
          <div className="d-flex gap-3 mb-5">
            <button 
              className={`btn btn-lg ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleLike}
              disabled={!user}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i> 
              {isLiked ? ' Liked' : ' Like'}
            </button>
            
            {/* --- SAVE BUTTON AB API SE CONNECTED HAI --- */}
            <button 
              className={`btn btn-lg ${isSaved ? 'btn-success' : 'btn-outline-success'}`}
              onClick={handleSave}
              disabled={!user}
            >
              <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i> 
              {isSaved ? ' Saved' : ' Save'}
            </button>
            {/* ------------------------------------------- */}
            
            {/* --- NAYA DOWNLOAD BUTTON (SIRF FILES KE LIYE) --- */}
            {/* --- CHANGE: Check karne ka tareeka update kiya gaya hai --- */}
            {(item.fileResourceType === 'image' || item.type.includes('image') ||
              item.fileResourceType === 'video' || item.type.includes('video') ||
              item.fileResourceType === 'raw' || item.type.includes('pdf')) && (
                
                <a 
                  href={getDownloadUrl(item.url, item.title)} // 'getDownloadUrl' function ka use karein
                  download={item.title} // 'download' attribute ab bhi rakhein (file ka naam suggest karne ke liye)
                  rel="noopener noreferrer" 
                  className="btn btn-lg btn-info"
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </a>
              )}
            {/* ----------------------------------------------- */}

          </div>

        </div>
      </div>
    </div>
  );
}