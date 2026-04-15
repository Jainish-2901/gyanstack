import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNestedCategories } from '../../hooks/useCategories';
import SearchBar from '../../components/SearchBar';
import ContentList from '../../components/ContentList';
import ShareButton from '../../components/ShareButton';
import LoadingScreen from '../../components/LoadingScreen';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, hoverScale } from '../../utils/animations';
import SEOHead from '../../components/SEOHead';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeBreadcrumbRef = useRef(null);
  const categoryId = searchParams.get('category')?.trim();
  const searchTerm = searchParams.get('search') || '';
  const uploaderFilter = searchParams.get('uploader') || '';
  const sortBy = searchParams.get('sortBy') || 'date';
  const order = searchParams.get('order') || 'desc';

  const { data: categories = [], isLoading: categoriesLoading } = useNestedCategories();

  const [currentPath, setCurrentPath] = useState([]);
  const [displaySubCats, setDisplaySubCats] = useState([]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    let newPath = [];
    if (categoryId) {
      const findAndBuildPath = (cats, id) => {
        for (const c of cats) {
          if (c._id === id) {
            newPath.push({ id: c._id, name: c.name, children: c.children });
            return true;
          }
          if (c.children && findAndBuildPath(c.children, id)) {
            newPath.unshift({ id: c._id, name: c.name, children: c.children });
            return true;
          }
        }
        return false;
      };
      findAndBuildPath(categories, categoryId);
    }

    const leaf = newPath[newPath.length - 1];
    const newSubCats = leaf ? (leaf.children || []) : categories;

    setCurrentPath(prev => {
      if (JSON.stringify(prev) === JSON.stringify(newPath)) return prev;
      return newPath;
    });

    setDisplaySubCats(prev => {
      if (JSON.stringify(prev) === JSON.stringify(newSubCats)) return prev;
      return newSubCats;
    });
  }, [categoryId, categories]);

  useEffect(() => {
    if (activeBreadcrumbRef.current) {
      activeBreadcrumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [categoryId, currentPath]);

  const handleFolderClick = (id) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', id);
    setSearchParams(params);
  };

  const handleGoRoot = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
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

  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);

    if (!term.trim()) {
      params.delete('search');
      params.delete('uploader');
      setSearchParams(params);
      return;
    }

    if (term.includes('@')) {
      const [s, u] = term.split('@');
      if (s.trim()) params.set('search', s.trim());
      else params.delete('search');
      if (u.trim()) params.set('uploader', u.trim());
      else params.delete('uploader');
    } else {
      params.set('search', term);
      params.delete('uploader');
    }
    setSearchParams(params);
  };

  if (categoriesLoading) return <LoadingScreen text="Opening Library..." />;

  const pageTitle = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : "All Content";

  return (
    <div className="container-fluid py-4 fade-in px-3 px-lg-5">
      <SEOHead
        title={pageTitle !== 'All Content' ? `${pageTitle} | Browse` : 'Browse Library'}
        description={`Browse ${pageTitle} on GyanStack. Access study notes, PYQs, and NEP 2020 materials for Gujarat University students.`}
        isHomePage={false}
      />
      <div className="row g-4">

        {/* TOP SECTION: Search & Breadcrumbs */}
        <motion.div className="col-12" variants={fadeInUp} initial="initial" animate="animate">
          <div className="glass-panel p-4 rounded-5 border-0 shadow-sm mb-4">
            <h2 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              <i className="bi bi-search-heart text-primary me-2"></i>Browse Library
            </h2>
            <SearchBar
              onSearch={handleSearch}
              initialValue={searchTerm + (uploaderFilter ? `@${uploaderFilter}` : '')}
              placeholder={pageTitle !== 'All Content' ? `Search inside ${pageTitle}...` : "Search across all resources or use @username..."}
            />
          </div>

          <div className="glass-panel p-2 px-3 rounded-pill mb-4 d-flex align-items-center gap-2 shadow-sm border-0 overflow-auto no-scrollbar" style={{ background: 'var(--glass-bg)' }}>
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
                  ref={idx === currentPath.length - 1 && !searchTerm ? activeBreadcrumbRef : null}
                  onClick={() => handleFolderClick(path.id)}
                  className={`btn btn-sm rounded-pill text-nowrap flex-shrink-0 ${idx === currentPath.length - 1 && !searchTerm ? 'btn-primary shadow' : 'btn-link text-decoration-none text-dark'}`}
                >
                  {path.name}
                </button>
              </React.Fragment>
            ))}

            {(categoryId || searchTerm || uploaderFilter) && (
              <button
                onClick={() => setSearchParams({})}
                className="btn btn-sm btn-outline-danger border-0 rounded-pill ms-auto flex-shrink-0 small"
                title="Clear All Filters"
              >
                <i className="bi bi-x-circle me-1"></i>Reset
              </button>
            )}
          </div>
        </motion.div>

        <div className="col-12">
          {!searchTerm && displaySubCats.length > 0 && (
            <div className="row g-3 mb-5">
              <div className="col-12">
                <h6 className="fw-bold text-primary small text-uppercase tracking-wider mb-0">Folders</h6>
              </div>
              <motion.div 
                className="row g-3 w-100 mx-0"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {displaySubCats.map(cat => (
                  <motion.div key={cat._id} className="col-6 col-md-6 col-lg-4 col-xl-3" variants={fadeInUp}>
                    <motion.div
                      onClick={() => handleFolderClick(cat._id)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="folder-card glass-panel p-2 p-md-3 rounded-4 border-0 d-flex flex-column flex-md-row align-items-center align-items-md-center gap-2 gap-md-3 cursor-pointer shadow-sm h-100 text-center text-md-start"
                    >
                      <div className="folder-icon bg-warning bg-opacity-10 rounded-3 p-1 p-md-2 d-flex align-items-center justify-content-center cursor-pointer">
                        <i className="bi bi-folder-fill text-warning fs-5 fs-md-4"></i>
                      </div>
                      <div className="overflow-hidden cursor-pointer w-100">
                        <div className="fw-bold extra-small-title text-dark text-break" style={{ fontSize: '0.85rem' }}>{cat.name}</div>
                        <small className="text-muted extra-small d-block">
                          {cat.children?.length || 0} {cat.children?.length === 1 ? 'folder' : 'folders'} • {cat.itemCount || 0} {cat.itemCount === 1 ? 'item' : 'items'}
                        </small>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between mb-4 pb-3 border-bottom border-light gap-3">
            <div className="flex-grow-1">
              <h4 className="fw-bold mb-0 text-md-nowrap-custom">
                {searchTerm
                  ? (categoryId && pageTitle !== "All Content"
                    ? <span><span className="text-primary">"{searchTerm}"</span> in <span className="text-secondary border-bottom border-secondary border-opacity-25 cursor-pointer" onClick={() => handleFolderClick(categoryId)}>{pageTitle}</span></span>
                    : `Search Results: "${searchTerm}"`)
                  : <span className={categoryId ? "cursor-pointer text-primary" : ""} onClick={() => categoryId && handleFolderClick(categoryId)}>{pageTitle}</span>
                }
              </h4>
              {uploaderFilter && <small className="text-primary fw-bold d-block mt-1">By Uploader: {uploaderFilter}</small>}
            </div>

            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-between justify-content-sm-end">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-filter-left text-muted d-none d-md-block"></i>
                <select
                  className="form-select form-select-sm rounded-pill border-light shadow-sm"
                  style={{ width: 'auto', minWidth: '140px', background: 'var(--glass-bg)', paddingRight: '2rem' }}
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

              <ShareButton
                title={`Explore ${pageTitle} on GyanStack`}
                url={window.location.href}
                className="btn btn-outline-primary rounded-circle btn-sm p-2 d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
              />
            </div>
          </div>

          <ContentList
            categoryId={categoryId}
            searchTerm={searchTerm}
            uploaderName={uploaderFilter}
            sortBy={sortBy}
            order={order}
          />
        </div>
      </div>

      <style>{`
        .folder-card { transition: all 0.2s; background: var(--glass-bg) !important; border: 1px solid var(--glass-border) !important; }
        .folder-card:hover { transform: translateY(-3px); box-shadow: var(--glass-shadow) !important; border: 1px solid var(--primary) !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .extra-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
}