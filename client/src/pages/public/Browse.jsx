import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import ContentList from '../../components/ContentList';
import api from '../../services/api';
import ShareButton from '../../components/ShareButton';
import LoadingScreen from '../../components/LoadingScreen';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Breadcrumb Path Tracking: [{id, name, children}]
  const [currentPath, setCurrentPath] = useState([]);
  const [displaySubCats, setDisplaySubCats] = useState([]);

  // URL values derivation
  const categoryId = searchParams.get('category') || null;
  const searchTerm = searchParams.get('search') || '';
  const uploaderFilter = searchParams.get('uploader') || '';

  // 1. Initial Fetch: Get the Root Categories
  useEffect(() => {
    const fetchRoot = async () => {
      setCategoriesLoading(true);
      try {
        const { data } = await api.get('/categories/all-nested');
        const rootCats = data.categories || data;
        setCategories(rootCats);

        // If no category in URL, show Root
        if (!categoryId) {
          setDisplaySubCats(rootCats);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchRoot();
  }, []);

  // 2. Sync UI when URL changes (Direct Link support)
  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const path = [];
      const findAndBuildPath = (cats, id) => {
        for (const c of cats) {
          if (c._id === id) {
            path.push({ id: c._id, name: c.name, children: c.children });
            return true;
          }
          if (c.children && findAndBuildPath(c.children, id)) {
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

  // 3. Navigation Logic (Folder Click)
  const handleFolderClick = (id, name, children) => {
    setSearchParams({ category: id });
    // Path and displaySubCats will update via the useEffect above
  };

  const handleGoRoot = () => {
    setSearchParams({});
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchParams({});
      return;
    }
    const params = {};
    if (term.includes('@')) {
      const [s, u] = term.split('@');
      if (s.trim()) params.search = s.trim();
      if (u.trim()) params.uploader = u.trim();
    } else {
      params.search = term;
    }
    setSearchParams(params);
  };

  if (categoriesLoading) return <LoadingScreen text="Opening Library..." />;

  const pageTitle = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : "All Content";

  return (
    <div className="container-fluid py-4 fade-in px-3 px-lg-5">
      <div className="row g-4">

        {/* TOP SECTION: Search & Breadcrumbs */}
        <div className="col-12">
          <div className="glass-panel p-4 rounded-5 border-0 shadow-sm mb-4">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-search-heart text-primary me-2"></i>Browse Library
            </h2>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* FOLDER EXPLORER BREADCRUMB */}
          <div className="glass-panel p-2 px-3 rounded-pill mb-4 d-flex align-items-center gap-2 shadow-sm border-0 overflow-auto no-scrollbar" style={{ background: 'rgba(255,255,255,0.7)' }}>
            <button
              onClick={handleGoRoot}
              className={`btn btn-sm rounded-pill flex-shrink-0 ${!categoryId ? 'btn-primary shadow' : 'btn-link text-decoration-none text-dark'}`}
            >
              <i className="bi bi-house-door-fill"></i>
            </button>

            {currentPath.map((path, idx) => (
              <React.Fragment key={path.id}>
                <i className="bi bi-chevron-right text-muted opacity-50 small flex-shrink-0"></i>
                <button
                  onClick={() => handleFolderClick(path.id, path.name, path.children)}
                  className={`btn btn-sm rounded-pill text-nowrap flex-shrink-0 ${idx === currentPath.length - 1 ? 'btn-primary shadow' : 'btn-link text-decoration-none text-dark'}`}
                >
                  {path.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="col-12">
          {/* Sub-Folders Grid (Visible only when not searching) */}
          {!searchTerm && displaySubCats.length > 0 && (
            <div className="row g-3 mb-5">
              <div className="col-12">
                <h6 className="fw-bold text-primary small text-uppercase tracking-wider mb-0">Folders</h6>
              </div>
              {displaySubCats.map(cat => (
                <div key={cat._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                  <div
                    onClick={() => handleFolderClick(cat._id, cat.name, cat.children)}
                    className="folder-card glass-panel p-3 rounded-4 border-0 d-flex align-items-center gap-3 cursor-pointer shadow-sm h-100"
                  >
                    <div className="folder-icon bg-warning bg-opacity-10 rounded-3 p-2 d-flex align-items-center justify-content-center">
                      <i className="bi bi-folder-fill text-warning fs-4"></i>
                    </div>
                    <div className="overflow-hidden">
                      <div className="fw-bold small text-dark" style={{ wordBreak: 'break-word' }}>{cat.name}</div>
                      <small className="text-muted extra-small">{cat.children?.length || 0} sub-folders</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TITLE & SHARE BAR */}
          <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-light flex-wrap gap-2">
            <div className="me-auto">
              <h4 className="fw-bold mb-0 text-dark">
                {searchTerm ? `Search Results: ${searchTerm}` : pageTitle}
              </h4>
              {uploaderFilter && <small className="text-primary fw-bold">By Uploader: {uploaderFilter}</small>}
            </div>
            <ShareButton
              title={`Explore ${pageTitle} on GyanStack`}
              url={window.location.href}
              className="btn btn-outline-primary rounded-pill btn-sm px-4"
            />
          </div>

          {/* ACTUAL CONTENT LIST */}
          <ContentList
            categoryId={categoryId}
            searchTerm={searchTerm}
            uploaderName={uploaderFilter}
          />
        </div>
      </div>

      <style>{`
        .folder-card { transition: all 0.2s; background: #fff !important; }
        .folder-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; border: 1px solid var(--bs-primary) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .extra-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
}