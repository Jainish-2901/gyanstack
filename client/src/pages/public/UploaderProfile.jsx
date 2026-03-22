import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ContentCard from '../../components/ContentCard';
import LoadingScreen from '../../components/LoadingScreen';
import ShareButton from '../../components/ShareButton';
import SearchBar from '../../components/SearchBar';
import NotFound from './NotFound';

export default function UploaderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [fullTree, setFullTree] = useState([]);
  const [allContents, setAllContents] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [displayData, setDisplayData] = useState({ subCats: [], items: [] });
  const [uploaderStats, setUploaderStats] = useState({ totalDocs: 0, catCount: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const cache = useRef({});

  const isSearchActive = searchTerm.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const q = searchTerm.toLowerCase();
    return allContents.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [searchTerm, allContents, isSearchActive]);

  const navigateToFolder = useCallback(async (catId, catName, children = null) => {
    setSearchTerm('');
    if (catId === null) {
      setCurrentPath([]);
    } else {
      setCurrentPath(prev => {
        const existingIdx = prev.findIndex(p => p.id === catId);
        if (existingIdx !== -1) return prev.slice(0, existingIdx + 1);
        return [...prev, { id: catId, name: catName, children }];
      });
    }

    const subFolders = children || [];
    let folderItems = [];

    if (catId) {
      if (cache.current[catId]) {
        folderItems = cache.current[catId];
        setDisplayData({ subCats: subFolders, items: folderItems });
      } else {
        setLoadingItems(true);
        try {
          const { data } = await api.get(`/content?uploaderId=${id}&categoryId=${catId}&limit=24`);
          folderItems = data.content || data;
          cache.current[catId] = folderItems;
          setDisplayData({ subCats: subFolders, items: folderItems });
        } catch (err) {
          setDisplayData({ subCats: subFolders, items: [] });
        } finally {
          setLoadingItems(false);
        }
      }
    } else {
      setDisplayData({ subCats: subFolders, items: [] });
    }
  }, [id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [uploaderRes, catRes] = await Promise.all([
          api.get(`/auth/uploader/${id}`),
          api.get('/categories/all-nested')
        ]);
        const user = uploaderRes.data.user;
        const contents = uploaderRes.data.contents || [];
        const rootCats = catRes.data.categories || catRes.data;

        setProfile(user);
        setAllContents(contents);
        const distinctCats = new Set(contents.map(c => c.categoryId));
        setUploaderStats({ totalDocs: contents.length, catCount: distinctCats.size });
        setFullTree(rootCats);
        setDisplayData({ subCats: rootCats, items: [] });
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleCopyEmail = (e, email) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) return <LoadingScreen text="Fetching profile..." />;
  if (error) return <NotFound />;

  return (
    <div className="container-fluid py-3 py-md-5 fade-in px-2 px-md-4 px-lg-5">
      <div className="row g-3 g-lg-4">

        {/* --- SIDEBAR: Complete Profile Info --- */}
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

        {/* --- MAIN AREA: Explorer & Search --- */}
        <div className="col-12 col-lg-8 col-xl-9">

          <SearchBar
            onSearch={(term) => setSearchTerm(term)}
            initialValue={searchTerm}
          />

          {isSearchActive ? (
            <div className="fade-in row g-3 mt-2">
              <div className="col-12"><h6 className="fw-bold small px-2">Results for "{searchTerm}"</h6></div>
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <div key={item._id} className="col-12 col-md-6 col-xl-4"><ContentCard item={item} /></div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">No files matched your search.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="fade-in mt-2">
              {/* Breadcrumbs */}
              <div className="glass-panel p-2 px-3 rounded-pill mb-4 d-flex align-items-center gap-2 shadow-sm border-0 overflow-auto no-scrollbar">
                <button onClick={() => navigateToFolder(null, "Root", fullTree)} className={`btn btn-sm rounded-pill flex-shrink-0 ${currentPath.length === 0 ? 'btn-primary shadow-sm' : 'btn-light'}`}>
                  <i className="bi bi-house-door-fill"></i>
                </button>
                {currentPath.map((path, idx) => (
                  <React.Fragment key={path.id}>
                    <i className="bi bi-chevron-right text-muted opacity-50 x-small flex-shrink-0"></i>
                    <button onClick={() => navigateToFolder(path.id, path.name, path.children)} className={`btn btn-sm rounded-pill text-nowrap flex-shrink-0 ${idx === currentPath.length - 1 ? 'btn-primary shadow-sm' : 'btn-light'}`}>
                      <span className="small">{path.name}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Grid */}
              <div className="row g-3">
                {displayData.subCats.map(cat => (
                  <div key={cat._id} className="col-12 col-md-6 col-xl-4">
                    <div onClick={() => navigateToFolder(cat._id, cat.name, cat.children)} className="folder-card glass-panel p-3 rounded-4 border-0 d-flex align-items-center gap-3 cursor-pointer shadow-sm h-100">
                      <div className="folder-icon bg-warning bg-opacity-10 rounded-3 p-2">
                        <i className="bi bi-folder-fill text-warning fs-3"></i>
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-bold small text-dark" style={{ lineHeight: '1.2' }}>{cat.name}</div>
                        <small className="text-muted x-small">{cat.children?.length || 0} folders</small>
                      </div>
                    </div>
                  </div>
                ))}

                {loadingItems ? (
                  <div className="col-12 text-center py-5"><div className="spinner-border text-primary border-3"></div></div>
                ) : (
                  <>
                    {displayData.items.length > 0 && <div className="col-12 mt-4 mb-2"><h6 className="fw-bold text-muted x-small text-uppercase tracking-wider">Documents</h6></div>}
                    {displayData.items.map(item => (
                      <div key={item._id} className="col-12 col-md-6 col-xl-4"><ContentCard item={item} /></div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
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