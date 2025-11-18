import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
  
  // 1. Text/Note Type
  if (item.type === 'note' || item.textNote) {
    const [isExpanded, setIsExpanded] = useState(false);
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


// --- Main Content Card Component ---

export default function ContentCard({ item }) {
  
  // --- CHANGE ---
  // Check karein ki preview dikhana hai ya icon
  const showPreview = item.type === 'note' || item.type === 'link';
  const isFileType = !showPreview;
  
  // Agar file type hai, to icon class fetch karein
  const iconClass = isFileType ? getIcon(item.type) : null;
  
  // --- CHANGE ---
  // Niche waale button ko content type ke hisaab se change karein
  // Ab sabhi buttons 'View Details' page par jayenge
  const renderActionButton = () => {
    return (
      <Link 
        to={`/content/${item._id}`} // Sabhi types ke liye detail page ka link
        className="btn btn-primary btn-sm"
      >
        View Details
      </Link>
    );
  };

  return (
    <div className="card shadow-sm h-100">
      
      {/* --- YEH SIRF NOTE/LINK KE LIYE CHALEGA --- */}
      {showPreview && <ContentPreview item={item} />}
      {/* ------------------------------------------- */}

      <div className="card-body d-flex flex-column">
        
        {/* --- YEH SIRF FILE TYPES (PDF, IMG, VID) KE LIYE CHALEGA --- */}
        {isFileType ? (
          // Puraana Icon waala layout
          <div className="d-flex align-items-start mb-2">
            <i className={`bi ${iconClass} fs-2 me-3`}></i>
            <div className='flex-grow-1'>
              <h5 className="card-title fw-bold">{item.title}</h5>
              <p className="card-text small text-muted">
                Views: {item.viewsCount} | Likes: {item.likesCount}
              </p>
            </div>
          </div>
        ) : (
          // Naya 'Note/Link' waala layout (bina icon)
          <>
            <h5 className="card-title fw-bold mt-2">{item.title}</h5>
            <p className="card-text small text-muted">
              Views: {item.viewsCount} | Likes: {item.likesCount}
            </p>
          </>
        )}
        {/* ----------------------------------------------------------- */}
        
        {/* Tags */}
        <div className="mb-3">
          {item.tags?.map(tag => (
            <span key={tag} className="badge bg-secondary me-1">{tag}</span>
          ))}
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          
          {/* --- YEH NAYA SMART ACTION BUTTON HAI --- */}
          {renderActionButton()}
          {/* --------------------------------------- */}

          {/* TODO: Save & Like button logic */}
          <button className="btn btn-outline-danger btn-sm">
            <i className="bi bi-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
}