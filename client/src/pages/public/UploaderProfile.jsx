import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useUploaderProfile } from '../../hooks/useUsers';
import { useNestedCategories } from '../../hooks/useCategories';
import ContentList from '../../components/ContentList';
import LoadingScreen from '../../components/LoadingScreen';
import ShareButton from '../../components/ShareButton';
import SearchBar from '../../components/SearchBar';
import NotFound from './NotFound';

export default function UploaderProfile() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category')?.trim();
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'date';
  const order = searchParams.get('order') || 'desc';
  
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUploaderProfile(id);
  const { data: categories = [], isLoading: categoriesLoading } = useNestedCategories();

  const profile = profileData?.user;
  const contents = profileData?.contents || [];
  
  const [currentPath, setCurrentPath] = useState([]);
  const [displaySubCats, setDisplaySubCats] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const path = [];
      const findAndBuildPath = (cats, cid) => {
        for (const c of cats) {
          if (c._id === cid) {
            path.push({ id: c._id, name: c.name, children: c.children });
            return true;
          }
          if (c.children && findAndBuildPath(c.children, cid)) {
            path.unshift({ id: c._id, name: c.name, children: c.children });
            return true;
          }
        }
        return false;
      };

      findAndBuildPath(categories, categoryId);
      setCurrentPath(path);
      const leaf = path[path.length - 1];
      setDisplaySubCats(leaf?.children || []);
    } else if (!categoryId) {
      setCurrentPath([]);
      setDisplaySubCats(categories);
    }
  }, [categoryId, categories]);

  const handleFolderClick = (cid) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', cid);
    setSearchParams(params);
  };

  const handleGoRoot = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    setSearchParams(params);
  };

  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);
    if (!term.trim()) {
      params.delete('search');
    } else {
      params.set('search', term.trim());
    }
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    
    if (value === 'date_desc') {
        params.delete('sortBy');
        params.delete('order');
    } else {
        const [sort, ord] = value.split('_');
        params.set('sortBy', sort);
        params.set('order', ord);
    }
    setSearchParams(params);
  };



  const handleCopyEmail = (e, email) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (profileLoading || categoriesLoading) return <LoadingScreen text="Fetching profile..." />;
  if (profileError || !profile) return <NotFound />;

  const uploaderStats = {
    totalDocs: contents.length,
    catCount: new Set(contents.map(c => c.categoryId)).size
  };

  return (
    <div className="container-fluid py-3 py-md-5 fade-in px-2 px-md-4 px-lg-5">
      <div className="row g-3 g-lg-4">

        <div className="col-12 col-lg-4 col-xl-3">
          <div className="glass-panel p-4 rounded-4 shadow-sm border-0 sticky-profile">
            <div className="d-flex flex-row flex-lg-column align-items-center gap-3">

              <div className="flex-shrink-0">
                <div className="rounded-circle border border-3 border-white shadow-sm overflow-hidden bg-primary d-flex align-items-center justify-content-center"
                  style={{ width: 'clamp(80px, 20vw, 120px)', height: 'clamp(80px, 20vw, 120px)' }}>
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <span className="text-white fw-bold fs-1">{profile.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className="flex-grow-1 text-start text-lg-center w-100 overflow-hidden">
                <h4 className="fw-bold mb-1 text-dark">{profile.username}</h4>
                <p className="text-primary small fw-bold mb-3 d-none d-lg-block">Verified Contributor</p>

                <div className="d-flex flex-wrap justify-content-start justify-content-lg-center gap-2 mb-3">
                  <div className="badge bg-primary bg-opacity-10 text-primary x-small rounded-pill px-3 py-2">
                    <i className="bi bi-file-earmark-check me-1"></i>{uploaderStats.totalDocs} Uploads
                  </div>
                  <div className="badge bg-success bg-opacity-10 text-success x-small rounded-pill px-3 py-2">
                    <i className="bi bi-folder2 me-1"></i>{uploaderStats.catCount} Categories
                  </div>
                </div>

                {/* Re-added Joined Date */}
                <p className="extra-small text-muted mb-3">
                  <i className="bi bi-calendar3 me-1"></i> Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>

                <hr className="opacity-10 d-none d-lg-block" />

                {/* Contact Info */}
                <div className="d-flex flex-column gap-2 mt-2">
                  {profile.email && (
                    <div className="d-flex align-items-center gap-2">
                      <a href={`mailto:${profile.email}`} className="btn btn-light btn-sm border-0 flex-grow-1 text-start rounded-3 bg-opacity-50 px-2 py-2 overflow-hidden shadow-none">
                        <i className="bi bi-envelope-at text-primary me-2"></i>
                        <span className="x-small text-muted text-truncate d-inline-block" style={{ maxWidth: '140px' }}>{profile.email}</span>
                      </a>
                      <button className="btn btn-sm btn-light border-0 shadow-none" onClick={(e) => handleCopyEmail(e, profile.email)}>
                        <i className={`bi ${copySuccess ? 'bi-check-lg text-success' : 'bi-copy'}`}></i>
                      </button>
                    </div>
                  )}
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="btn btn-light btn-sm border-0 text-start rounded-3 px-2 py-2 shadow-none">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      <span className="x-small text-muted">{profile.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <ShareButton className="btn btn-primary rounded-pill w-100 py-2 fw-bold small shadow-sm" />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8 col-xl-9">
          
          <div className="glass-panel p-3 p-md-4 rounded-4 border-0 shadow-sm mb-4">
             <div className="d-flex align-items-center gap-2 mb-3">
               <i className="bi bi-person-workspace text-primary fs-4"></i>
               <h5 className="fw-bold mb-0">Resource Explorer</h5>
             </div>
             <SearchBar
               onSearch={handleSearch}
               initialValue={searchTerm}
               placeholder={currentPath.length > 0 ? `Search items of ${profile?.username || 'uploader'} in ${currentPath[currentPath.length-1].name}...` : `Search across all files of ${profile?.username || 'uploader'}...`}
             />
          </div>

          <div className="fade-in mt-2">
            {/* Breadcrumbs */}
            <div className="glass-panel p-2 px-3 rounded-pill mb-4 d-flex align-items-center gap-2 shadow-sm border-0 overflow-auto no-scrollbar" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <button 
                onClick={handleGoRoot} 
                className={`btn btn-sm rounded-pill flex-shrink-0 ${!categoryId ? 'btn-primary shadow-sm' : 'btn-link text-decoration-none text-dark'}`}
              >
                <i className="bi bi-house-door-fill"></i>
              </button>
              {currentPath.map((path, idx) => (
                <React.Fragment key={path.id}>
                  <i className="bi bi-chevron-right text-muted opacity-50 x-small flex-shrink-0"></i>
                  <button 
                    onClick={() => handleFolderClick(path.id)} 
                    className={`btn btn-sm rounded-pill text-nowrap flex-shrink-0 ${idx === currentPath.length - 1 && !searchTerm ? 'btn-primary shadow-sm' : 'btn-link text-decoration-none text-dark'}`}
                  >
                    <span className="small">{path.name}</span>
                  </button>
                </React.Fragment>
              ))}

              {(categoryId || searchTerm) && (
                <button 
                  onClick={() => setSearchParams({})} 
                  className="btn btn-sm btn-outline-danger border-0 rounded-pill ms-auto flex-shrink-0 small"
                  title="Reset Library"
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
              )}
            </div>

            {/* FOLDERS GRID */}
            {!searchTerm && displaySubCats.length > 0 && (
              <div className="row g-3 mb-5">
                <div className="col-12"><h6 className="fw-bold text-primary x-small text-uppercase tracking-wider mb-0">Folders</h6></div>
                {displaySubCats.map(cat => (
                  <div key={cat._id} className="col-12 col-md-6 col-xl-4">
                    <div 
                      onClick={() => handleFolderClick(cat._id)} 
                      className="folder-card glass-panel p-3 rounded-4 border-0 d-flex align-items-center gap-3 cursor-pointer shadow-sm h-100"
                    >
                      <div className="folder-icon bg-warning bg-opacity-10 rounded-3 p-2 d-flex align-items-center justify-content-center cursor-pointer">
                        <i className="bi bi-folder-fill text-warning fs-3"></i>
                      </div>
                      <div className="flex-grow-1 overflow-hidden cursor-pointer" style={{ minWidth: 0 }}>
                        <div className="fw-bold small text-dark text-truncate" style={{ lineHeight: '1.2' }}>{cat.name}</div>
                        <small className="text-muted x-small">{cat.children?.length || 0} folders</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DOCUMENTS GRID (ContentList) */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 pb-3 border-bottom border-light gap-3">
              <div className="flex-grow-1">
                <h5 className="fw-bold mb-0 text-dark">
                  {searchTerm 
                    ? (categoryId && currentPath.length > 0
                      ? <span>Showing <span className="text-primary">"{searchTerm}"</span> in <span className="text-secondary">{currentPath[currentPath.length-1].name}</span></span>
                      : <span>Showing results for <span className="text-primary">"{searchTerm}"</span></span>)
                    : (currentPath.length > 0 ? currentPath[currentPath.length - 1].name : "All Shared Resources")
                  }
                </h5>
              </div>

              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-filter-left text-muted d-none d-sm-block"></i>
                <select 
                    className="form-select form-select-sm rounded-pill border-light shadow-sm"
                    style={{ width: 'auto', minWidth: '160px', background: 'rgba(255,255,255,0.7)', paddingRight: '2rem' }}
                    value={`${sortBy}_${order}`}
                    onChange={handleSortChange}
                >
                    <option value="date_desc">Recently Added</option>
                    <option value="views_desc">Most Visited</option>
                    <option value="likes_desc">Most Liked</option>
                    <option value="saves_desc">Most Saved</option>
                    <option value="downloads_desc">Most Downloaded</option>
                    <option value="title_asc">A - Z</option>
                </select>
              </div>
            </div>

            <ContentList
              categoryId={categoryId}
              searchTerm={searchTerm}
              uploaderName={profile.username}
              sortBy={sortBy}
              order={order}
            />
          </div>
        </div>
      </div>

      <style>{`
        .sticky-profile { position: sticky; top: 5.5rem; z-index: 10; }
        @media (max-width: 991px) { 
          .sticky-profile { position: relative; top: 0; margin-bottom: 1.5rem; } 
        }
        .folder-card { background: #fff !important; transition: all 0.25s ease; }
        .folder-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important; border: 1px solid var(--bs-primary) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .x-small { font-size: 0.75rem; }
        .extra-small { font-size: 0.8rem; }
      `}</style>
    </div>
  );
}