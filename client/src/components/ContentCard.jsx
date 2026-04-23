import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';
import ShareButton from './ShareButton';

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

const getIcon = (type) => {
  if (type.includes('pdf')) return 'bi-file-earmark-pdf-fill text-danger';
  if (type.includes('video')) return 'bi-file-earmark-play-fill text-info';
  if (type.includes('image')) return 'bi-file-earmark-image-fill text-success';
  if (type.includes('wordprocessingml') || type.includes('msword')) return 'bi-file-earmark-word-fill text-primary';
  if (type.includes('presentationml') || type.includes('powerpoint')) return 'bi-file-earmark-slides-fill text-warning';
  if (type.includes('spreadsheetml') || type.includes('excel')) return 'bi-file-earmark-excel-fill text-success';
  if (type.includes('zip') || type.includes('archive')) return 'bi-file-earmark-zip-fill text-secondary';
  return 'bi-file-earmark-fill text-secondary';
};

const ContentPreview = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (item.type === 'note' || item.textNote) {
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

  if (item.type === 'link') {
    const embedUrl = getYoutubeEmbedUrl(item.url);
    if (embedUrl) {
      const videoId = embedUrl.split('/').pop();
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      return (
        <div className="preview-box youtube-thumbnail position-relative overflow-hidden">
          <img 
            src={thumbnailUrl} 
            alt={item.title} 
            className="w-100 h-100 object-fit-cover"
            onError={(e) => { e.target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`; }}
          />
          <div className="position-absolute top-50 left-50 translate-middle">
             <i className="bi bi-play-circle-fill text-white display-4 opacity-75"></i>
          </div>
          <div className="position-absolute bottom-0 end-0 m-2">
             <span className="badge bg-dark bg-opacity-75 rounded-pill small">Video</span>
          </div>
        </div>
      );
    }
    return (
      <div className="preview-box download-box">
        <i className="bi bi-link-45deg fs-1 text-primary"></i>
        <p className="mb-0 small text-muted">This is an external link</p>
      </div>
    );
  }

  return null;
};


const cleanTitle = (title) => {
  if (!title) return '';
  const parts = title.split(/[,\-]+/).map(p => p.trim()).filter(p => p);
  const unique = [...new Set(parts)];
  return unique.length === 1 ? unique[0] : title;
};

export default function ContentCard({ item }) {
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(user && item.likedBy?.includes(user.id));
  const [likesCount, setLikesCount] = useState(item.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const showPreview = item.type === 'note' || item.type === 'link';
  const isFileType = !showPreview;
  
  const iconClass = isFileType ? getIcon(item.type) : null;
  
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/content/${item._id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation(); 
    if (!user) {
      toast.error("Please log in to like content.");
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

  const renderActionButton = () => {
    return (
      <Link 
        to={`/content/${item._id}`} 
        className="btn btn-primary rounded-pill px-3 py-2 shadow-sm"
        style={{ fontSize: '0.85rem' }}
      >
         <i className="bi bi-box-arrow-up-right me-1"></i>View
      </Link>
    );
  };

  return (
    <div 
      className="glass-card h-100 d-flex flex-column position-relative overflow-hidden transition-all" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      
      {showPreview && <ContentPreview item={item} />}

      <div className="card-body d-flex flex-column p-4">
        
        {isFileType ? (
          <div className="d-flex align-items-center mb-3">
            <div className="icon-wrapper bg-light rounded-circle shadow-sm me-3 flex-shrink-0" style={{width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <i className={`bi ${iconClass} fs-3`}></i>
            </div>
            <div className='flex-grow-1 overflow-hidden'>
              <h5 className="card-title fw-bold text-dark mb-1" style={{ fontSize: '1rem', lineHeight: '1.3' }}>{cleanTitle(item.title)}</h5>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <p className="card-text small text-muted mb-0">
                  <i className="bi bi-eye text-primary me-1"></i>{item.viewsCount} &nbsp;&nbsp; <i className={`bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>{likesCount}
                </p>
                {item.categoryId && (
                  <Link 
                    to={`/browse?category=${item.categoryId?._id || item.categoryId}`} 
                    className="text-primary text-decoration-none extra-small fw-bold border-start ps-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="bi bi-tag-fill me-1"></i>{item.categoryId?.name || 'Category'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-3 overflow-hidden">
            <h5 className="card-title fw-bold mt-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.3' }}>{cleanTitle(item.title)}</h5>
            <div className="d-flex flex-wrap gap-2 mb-2">
               <p className="card-text small text-muted mb-0">
                  <i className="bi bi-eye text-primary me-1"></i>{item.viewsCount} &nbsp;&nbsp; <i className={`bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>{likesCount}
               </p>
               {item.categoryId && (
                 <Link 
                   to={`/browse?category=${item.categoryId?._id || item.categoryId}`} 
                   className="text-primary text-decoration-none extra-small fw-bold"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <i className="bi bi-tag-fill me-1"></i>{item.categoryId?.name || 'Category'}
                 </Link>
               )}
            </div>
          </div>
        )}
        
        {/* Tags */}
        <div className="mb-3 d-flex flex-wrap gap-1 overflow-hidden">
          {item.tags?.map(tag => (
            <span key={tag} className="badge rounded-pill fw-normal" style={{backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)', fontSize: '0.7rem'}}>{tag}</span>
          ))}
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center border-top border-light pt-3">
          
          {renderActionButton()}

          <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
            <ShareButton 
              title={item.title} 
              url={`/content/${item._id}`} 
              isCircle={false}
              className="btn btn-light rounded-pill shadow-sm text-primary d-flex align-items-center px-2 py-1"
              style={{ fontSize: '0.75rem' }}
            >
              <i className={`bi bi-share-fill me-1`}></i>
              Share Content
            </ShareButton>
            <button 
              className={`btn btn-light rounded-pill shadow-sm d-flex align-items-center px-2 py-1 ${isLiked ? 'text-danger' : 'text-muted'}`} 
              style={{ fontSize: '0.75rem' }}
              onClick={handleLike}
              disabled={loading}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {isLiked ? 'Liked This' : 'Like This'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}