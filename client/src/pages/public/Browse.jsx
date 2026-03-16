import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import CategoryTree from '../../components/CategoryTree';
import ContentList from '../../components/ContentList';
import api from '../../services/api';
import ShareButton from '../../components/ShareButton';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Content');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // URL values derivation
  const categoryId = searchParams.get('category') || null;
  const searchTerm = searchParams.get('search') || '';
  const uploaderFilter = searchParams.get('uploader') || '';

  // Fetch Categories once for both Sidebar and Header Name lookup
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories/all-nested');
        setCategories(data.categories || data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Sync Category Name based on ID and fetched categories
  useEffect(() => {
    if (categoryId && categoryId !== 'root' && categories.length > 0) {
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
      
      const name = findCat(categories);
      if (name) setSelectedCategoryName(name);
      else setSelectedCategoryName('Category');
    } else if (searchTerm || uploaderFilter) {
      let displayName = '';
      if (searchTerm) displayName += `Search: ${searchTerm}`;
      if (uploaderFilter) displayName += `${searchTerm ? ' by ' : 'Uploader: '}${uploaderFilter}`;
      setSelectedCategoryName(displayName);
    } else {
      setSelectedCategoryName('All Content');
    }
  }, [categoryId, searchTerm, uploaderFilter, categories]);

  const handleCategorySelect = (id, name) => {
    setSearchParams({ category: id });
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchParams({});
      return;
    }
    
    if (term.includes('@')) {
      const parts = term.split('@');
      const s = parts[0].trim();
      const u = parts[1].trim();
      const params = {};
      if (s) params.search = s;
      if (u) params.uploader = u;
      setSearchParams(params);
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
              <CategoryTree 
                onCategorySelect={handleCategorySelect} 
                activeCategoryId={categoryId || 'root'}
                initialData={categories}
                isLoading={categoriesLoading}
              /> 
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
                url={window.location.href}
                className="btn btn-outline-primary rounded-pill btn-sm ms-2"
             />
          </div>
          
          <ContentList 
            categoryId={categoryId} 
            searchTerm={searchTerm} 
            uploaderName={uploaderFilter}
          />
        </main>
      </div>
    </div>
  );
}
