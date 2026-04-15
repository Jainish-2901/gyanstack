import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { useContentDetail, useRelatedContent, useContentMutation } from '../../hooks/useContent';
import ShareButton from '../../components/ShareButton';
import ContentCard from '../../components/ContentCard';
import NotFound from './NotFound';
import toast from 'react-hot-toast';
import SEOHead from '../../components/SEOHead';


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

  if (googleDriveId) {
    return `https://drive.google.com/uc?export=download&id=${googleDriveId}`;
  }

  if (url.includes('/upload/')) {
    const baseTitle = cleanTitle(title) || 'download';
    const safeName = baseTitle.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`);
  }

  return url;
};


const DrivePreview = ({ previewUrl, item }) => {
  const [blocked, setBlocked] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const viewUrl = item.url;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${item.googleDriveId}`;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) setBlocked(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [loaded]);

  if (blocked) {
    return (
      <div className="text-center p-4 p-md-5 rounded-4 border-0 shadow-sm animate-pulse" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}>
        <div className="mb-4">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
            <i className="bi bi-shield-lock-fill display-5 text-primary"></i>
          </div>
          <h4 className="fw-bold text-dark">Google Drive Secure View</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
            To protect your privacy, Google restricts embedding this file type. No worries! You can view it directly on Google Drive.
          </p>
        </div>
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm">
            <i className="bi bi-box-arrow-up-right me-2"></i>View on Google Drive
          </a>
          {item.googleDriveId && (
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary rounded-pill px-4 py-2">
              <i className="bi bi-cloud-arrow-down-fill me-2"></i>Download
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-sm rounded-4 overflow-hidden border-0">
      {!loaded && (
        <div className="d-flex flex-column align-items-center justify-content-center bg-light" style={{ height: '400px' }}>
          <div className="spinner-grow text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h6 className="fw-bold text-muted">Establishing Secure Connection...</h6>
          <p className="small text-muted opacity-75">Connecting to Google Cloud Services</p>
        </div>
      )}
      <div className="ratio ratio-4x3" style={{ minHeight: '400px', maxHeight: '80vh', display: loaded ? 'block' : 'none', borderRadius: '1rem' }}>
        <iframe
          src={previewUrl}
          title={item.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </div>
  );
};

const DetailPreview = ({ item }) => {
  const fileType = item.type || '';
  const resourceType = item.fileResourceType || 'raw';

  if (item.googleDriveId) {
    const previewUrl = `https://drive.google.com/file/d/${item.googleDriveId}/preview`;
    return <DrivePreview previewUrl={previewUrl} item={item} />;
  }

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

  if (resourceType === 'image' || fileType.includes('image')) {
    return (
      <div className="text-center bg-light p-2 rounded">
        <img src={item.url} className="img-fluid rounded shadow" alt={item.title} style={{ maxHeight: '75vh' }} />
      </div>
    );
  }

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




const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function ContentDetailPage() {
  // ...
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: item, isLoading: contentLoading } = useContentDetail(id);
  const { data: relatedItems = [] } = useRelatedContent(item?.categoryId, id);
  const { toggleLike, toggleSave, incrementDownload } = useContentMutation();

  const lastCountedId = useRef(null);

  useEffect(() => {
    if (lastCountedId.current === id) return;
    lastCountedId.current = id;
  }, [id]);

  const handleLike = () => {
    if (!user) {
      toast.error("Please log in to like content.");
      return;
    }
    toggleLike.mutate(id);
  };

  const handleSave = () => {
    if (!user) {
      toast.error("Please log in to save content.");
      return;
    }
    toggleSave.mutate(id);
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please log in to download content.");
      return;
    }
    incrementDownload.mutate(id, {
      onSuccess: () => {
        const downloadUrl = getDownloadUrl(item);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', item.title || 'download');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onError: () => {
        window.open(item.url, '_blank');
      }
    });
  };

  const handleGoBack = () => { navigate(-1); };

  if (contentLoading) return <LoadingScreen text="Loading content..." />;

  if (!item) {
    return <NotFound />;
  }

  return (
    <div className="container my-4 my-md-5 mx-auto fade-in">
      <SEOHead
        title={cleanTitle(item.title)}
        description={item.description || `Access ${cleanTitle(item.title)} on GyanStack – Notes, PYQs, and study materials for Gujarat University students.`}
        url={window.location.href}
        isHomePage={false}
      />
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
              {item.categoryId && (
                <div className="bg-light px-3 py-1 rounded-pill d-flex align-items-center">
                  <i className="bi bi-tag-fill me-2 text-primary"></i>
                  <span>Category: </span>
                  <Link to={`/browse?category=${item.categoryId?._id || item.categoryId}`} className="ms-1 text-primary text-decoration-none fw-bold">
                    {item.categoryId?.name || 'View Category'}
                  </Link>
                </div>
              )}
              <div className="bg-light px-3 py-1 rounded-pill">
                <i className="bi bi-calendar-check me-2"></i>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-2">
              <div className="d-flex align-items-center"><i className="bi bi-eye-fill me-2 text-info"></i>{item.viewsCount} Views</div>
              <div className="d-flex align-items-center"><i className="bi bi-heart-fill me-2 text-danger"></i>{item.likesCount} Likes</div>
              <div className="d-flex align-items-center"><i className="bi bi-cloud-download-fill me-2 text-success"></i>{item.downloadsCount} Downloads</div>
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

          {/* AGGREGATED METADATA SECTION (from Aggregator Pattern) */}
          {(item.externalMetadata?.googleDrive || item.externalMetadata?.cloudinary) && (
            <div className="mb-4 glass-panel p-3 p-md-4 rounded-4 border-0 shadow-sm animate-slide-up" style={{ background: 'var(--glass-bg)' }}>
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                <i className="bi bi-info-square-fill text-primary me-2"></i>Resource Intelligence
              </h6>
              <div className="row g-3">
                {/* Google Drive Info */}
                {item.externalMetadata.googleDrive && (
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                        <i className="bi bi-google-drive text-primary"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Drive Status</div>
                        <div className="fw-bold small">
                          {formatBytes(item.externalMetadata.googleDrive.size)} • {item.externalMetadata.googleDrive.mimeType?.split('/')[1]?.toUpperCase() || 'File'}
                        </div>
                        <div className="extra-small text-muted">Created: {new Date(item.externalMetadata.googleDrive.createdTime).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cloudinary Colors/OCR */}
                {item.externalMetadata.cloudinary && (
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-info bg-opacity-10 p-2 rounded-3">
                        <i className="bi bi-palette-fill text-info"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Visual Profile</div>
                        <div className="d-flex gap-1 mt-1">
                          {item.externalMetadata.cloudinary.colors?.slice(0, 5).map((color, idx) => (
                            <div key={idx} className="rounded-circle border" style={{ width: '16px', height: '16px', background: color[0], cursor: 'default' }} title={color[0]}></div>
                          ))}
                        </div>
                        {item.externalMetadata.cloudinary.ocr?.adv_ocr?.data?.[0]?.textAnnotations?.[0]?.description && (
                          <div className="extra-small text-muted mt-1 text-truncate" style={{ maxWidth: '200px' }}>
                            OCR: {item.externalMetadata.cloudinary.ocr.adv_ocr.data[0].textAnnotations[0].description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="row g-3 mb-5">
            {(() => {
              const hasDownload = item.url && item.type !== 'note' && item.type !== 'link';
              const colClass = hasDownload ? "col-12 col-sm-6 col-md-3" : "col-12 col-sm-4 col-md-4";

              return (
                <>
                  <div className={colClass}>
                    <button
                      className={`btn w-100 py-3 d-flex align-items-center justify-content-center h-100 ${item.likedBy?.includes(user?.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={handleLike}
                      disabled={toggleLike.isPending}
                    >
                      <i className={`bi ${item.likedBy?.includes(user?.id) ? 'bi-heart-fill' : 'bi-heart'} fs-5 me-2`}></i>
                      {item.likedBy?.includes(user?.id) ? 'Liked This' : 'Like This'}
                    </button>
                  </div>

                  <div className={colClass}>
                    <button
                      className={`btn w-100 py-3 d-flex align-items-center justify-content-center h-100 ${item.savedBy?.includes(user?.id) ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={handleSave}
                      disabled={toggleSave.isPending}
                    >
                      <i className={`bi ${item.savedBy?.includes(user?.id) ? 'bi-bookmark-fill' : 'bi-bookmark'} fs-5 me-2`}></i>
                      {item.savedBy?.includes(user?.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  <div className={colClass}>
                    <ShareButton
                      title={item.title}
                      url={window.location.href}
                      isCircle={false}
                      className={`btn w-100 py-3 d-flex align-items-center justify-content-center h-100 btn-outline-primary`}
                    >
                      <i className="bi bi-share-fill fs-5 me-2"></i>
                      Share Content
                    </ShareButton>
                  </div>

                  {hasDownload && (
                    <div className="col-12 col-sm-6 col-md-3">
                      <button
                        onClick={handleDownload}
                        className="btn btn-info w-100 py-3 shadow-sm rounded-pill fw-bold text-white d-flex align-items-center justify-content-center"
                      >
                        <i className="bi bi-cloud-arrow-down-fill me-2 fs-4"></i>
                        Download
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* RELATED RESOURCES SECTION */}
          {relatedItems.length > 0 && (
            <section className="mt-5 pt-5 border-top">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                    <i className="bi bi-collection-fill text-primary fs-4"></i>
                  </div>
                  <h3 className="fw-bold mb-0">Recommended for You</h3>
                </div>
                <Link
                  to={`/browse?categoryId=${item.categoryId}`}
                  className="btn btn-primary btn-sm rounded-pill px-3 py-2 shadow-sm"
                >
                  View More <i className="bi bi-arrow-right ms-1"></i>
                </Link>
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
