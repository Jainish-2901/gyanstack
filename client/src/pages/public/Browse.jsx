import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import CategoryTree from '../../components/CategoryTree';
import ContentList from '../../components/ContentList';
import api from '../../services/api';
import ShareButton from '../../components/ShareButton';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Content');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('');

  // URL search params ko check karein
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const term = searchParams.get('search');
    const uploader = searchParams.get('uploader');

    setUploaderFilter(uploader || '');

    if (categoryId) {
      setSelectedCategoryId(categoryId);
      // Category name fetch karein agar ID hai
      const fetchCategoryName = async () => {
        try {
          const { data } = await api.get('/categories/all-nested');
          const findCat = (cats) => {
            for (const c of cats) {
              if (c._id === categoryId) return c.name;
              if (c.children) {
                const found = findCat(c.children);
                if (found) return found;
              }
            }
            return null;
          };
          const name = findCat(data.categories);
          if (name) setSelectedCategoryName(name);
        } catch (err) {
          console.error("Failed to fetch cat name", err);
        }
      };
      fetchCategoryName();
    } else if (term || uploader) {
      setSearchTerm(term || '');
      let displayName = '';
      if (term) displayName += `Search: ${term}`;
      if (uploader) displayName += `${term ? ' by ' : 'Uploader: '}${uploader}`;
      setSelectedCategoryName(displayName);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategoryName('All Content');
    }
  }, [searchParams]);

  const handleCategorySelect = (id, name) => {
    setSearchParams({ category: id });
    setSearchTerm(''); 
    setUploaderFilter('');
  };

  const handleSearch = (term) => {
    // Check if term contains an uploader reference (e.g., "MERN @username" or just "@username")
    if (term.includes('@')) {
      const parts = term.split('@');
      const searchStr = parts[0].trim();
      const uploaderStr = parts[1].trim();
      
      const newParams = {};
      if (searchStr) newParams.search = searchStr;
      if (uploaderStr) newParams.uploader = uploaderStr;
      setSearchParams(newParams);
    } else {
      setSearchParams({ search: term });
    }
  };

  return (
    <div className="container fade-in my-4">
      <div className="row g-4">
        {/* Sidebar: Categories */}
        <aside className="col-lg-3">
          <div className="category-sidebar">
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light">
              <i className="bi bi-tags-fill me-2 fs-4 text-primary"></i>
              <h5 className="mb-0 fw-bold">Categories</h5>
            </div>
            <div className="">
              {/* onCategorySelect props pass karein */}
              <CategoryTree onCategorySelect={handleCategorySelect} /> 
            </div>
          </div>
        </aside>

        {/* Main Content: Search + List */}
        <main className="col-lg-9">
          <SearchBar onSearch={handleSearch} />
          
          <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-light">
             <i className="bi bi-collection-play me-3 fs-3 text-secondary"></i>
             <h2 className="fw-bold mb-0 text-dark me-auto">{selectedCategoryName}</h2>
             <ShareButton 
                title={`Check out ${selectedCategoryName} on GyanStack`}
                url={window.location.pathname + window.location.search}
                className="btn btn-outline-primary rounded-pill btn-sm ms-2"
             />
          </div>
          
          {/* Content ko yahaan render karein */}
          <ContentList 
            categoryId={selectedCategoryId} 
            searchTerm={searchTerm} 
            uploaderName={searchParams.get('uploader')}
          />

        </main>
      </div>
    </div>
  );
}
