import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// --- Helper Functions ---

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
  } catch (e) {
    // Invalid URL
  }
  return null;
};

/**
 * File type ke hisaab se icon return karta hai (Download Box ke liye)
 */
const getIcon = (type) => {
  // Yahaan hum 'fileResourceType' ki jagah 'type' (mimetype) par check karenge
  // Taaki image aur video ke liye bhi icon mile
  if (type.includes('pdf')) return 'bi-file-earmark-pdf-fill text-danger';
  if (type.includes('video')) return 'bi-file-earmark-play-fill text-info';
  if (type.includes('image')) return 'bi-file-earmark-image-fill text-success';
  if (type.includes('doc') || type.includes('word')) return 'bi-file-earmark-word-fill text-primary';
  if (type.includes('ppt') || type.includes('presentation')) return 'bi-file-earmark-slides-fill text-warning';
  if (type.includes('xls') || type.includes('excel')) return 'bi-file-earmark-excel-fill text-success';
  if (type.includes('zip') || type.includes('archive')) return 'bi-file-earmark-zip-fill text-secondary';
  return 'bi-file-earmark-fill text-secondary';
};

// --- Preview Component ---

/**
 * Ye naya component hai jo content type ke hisaab se preview dikhata hai
 * YEH AB SIRF 'NOTE' AUR 'LINK' KE LIYE CHALEGA
 */
const ContentPreview = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 1. Text/Note Type
  if (item.type === 'note' || item.textNote) {
    // Agar textNote null/undefined hai to empty string use karein
    const textNote = item.textNote || '';
    const previewText = textNote.slice(0, 150);
    
    return (
      <div className="preview-box text-preview">
        <p className="mb-0">
          {isExpanded ? textNote : previewText}
          {textNote.length > 150 && !isExpanded && '...'}
        </p>
        {textNote.length > 150 && (
          <button 
            className="btn btn-link btn-sm p-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  }

  // 2. Link Type (YouTube ya Normal Link)
  if (item.type === 'link') {
    const embedUrl = getYoutubeEmbedUrl(item.url);
    if (embedUrl) {
      // YouTube Video
      return (
        <div className="preview-box youtube-embed ratio ratio-16x9">
          <iframe
            src={embedUrl}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      );
    }
    // Normal Link
    return (
      <div className="preview-box download-box">
        <i className="bi bi-link-45deg fs-1 text-primary"></i>
        <p className="mb-0 small text-muted">This is an external link</p>
      </div>
    );
  }

  // --- CHANGE ---
  // Baaki sabhi types (Image, Video, Raw) ke liye 'null' return karein
  return null;
};


const cleanTitle = (title) => {
  if (!title) return '';
  // Split by common separators and check if they are all identical
  const parts = title.split(/[,\-]+/).map(p => p.trim()).filter(p => p);
  const unique = [...new Set(parts)];
  return unique.length === 1 ? unique[0] : title;
};

export default function ContentCard({ item }) {
  const { user } = useAuth();
  
  // Local state for like count and status
  const [isLiked, setIsLiked] = useState(user && item.likedBy?.includes(user.id));
  const [likesCount, setLikesCount] = useState(item.likesCount || 0);
  const [loading, setLoading] = useState(false);

  // --- CHANGE ---
  // Check karein ki preview dikhana hai ya icon
  const showPreview = item.type === 'note' || item.type === 'link';
  const isFileType = !showPreview;
  
  // Agar file type hai, to icon class fetch karein
  const iconClass = isFileType ? getIcon(item.type) : null;
  
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like content.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put(`/content/${item._id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error("Failed to like content", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CHANGE ---
  // Niche waale button ko content type ke hisaab se change karein
  // Ab sabhi buttons 'View Details' page par jayenge
  const renderActionButton = () => {
    return (
      <Link 
        to={`/content/${item._id}`} 
        className="btn btn-primary rounded-pill px-4 shadow-sm"
      >
         <i className="bi bi-box-arrow-up-right me-2"></i>View
      </Link>
    );
  };

  return (
    <div className="glass-card h-100 d-flex flex-column position-relative overflow-hidden">
      
      {/* --- YEH SIRF NOTE/LINK KE LIYE CHALEGA --- */}
      {showPreview && <ContentPreview item={item} />}
      {/* ------------------------------------------- */}

      <div className="card-body d-flex flex-column p-4">
        
        {/* --- YEH SIRF FILE TYPES (PDF, IMG, VID) KE LIYE CHALEGA --- */}
        {isFileType ? (
          // Puraana Icon waala layout
          <div className="d-flex align-items-center mb-3">
            <div className="icon-wrapper bg-light rounded-circle shadow-sm me-3 flex-shrink-0" style={{width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <i className={`bi ${iconClass} fs-3`}></i>
            </div>
            <div className='flex-grow-1'>
              <h5 className="card-title fw-bold text-dark mb-1 line-clamp-1">{cleanTitle(item.title)}</h5>
              <p className="card-text small text-muted mb-0">
                <i className="bi bi-eye text-primary me-1"></i>{item.viewsCount} &nbsp;&nbsp; <i className={`bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>{likesCount}
              </p>
            </div>
          </div>
        ) : (
          // Naya 'Note/Link' waala layout (bina icon)
          <div className="mb-3">
            <h5 className="card-title fw-bold mt-2 text-dark line-clamp-1">{cleanTitle(item.title)}</h5>
            <p className="card-text small text-muted">
               <i className="bi bi-eye text-primary me-1"></i>{item.viewsCount} &nbsp;&nbsp; <i className={`bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>{likesCount}
            </p>
          </div>
        )}
        {/* ----------------------------------------------------------- */}
        
        {/* Tags */}
        <div className="mb-4 d-flex flex-wrap gap-1">
          {item.tags?.map(tag => (
            <span key={tag} className="badge rounded-pill fw-normal" style={{backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)'}}>{tag}</span>
          ))}
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center border-top border-light pt-3">
          
          {/* --- YEH NAYA SMART ACTION BUTTON HAI --- */}
          {renderActionButton()}
          {/* --------------------------------------- */}

          {/* TODO: Save & Like button logic */}
          <button 
            className={`btn btn-light rounded-circle shadow-sm ${isLiked ? 'text-danger' : 'text-muted'}`} 
            style={{width: '40px', height: '40px', padding: 0}}
            onClick={handleLike}
            disabled={loading}
          >
            <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
          </button>
        </div>
      </div>
    </div>
  );
}