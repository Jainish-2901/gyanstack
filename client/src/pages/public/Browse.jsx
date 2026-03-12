import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import CategoryTree from '../../components/CategoryTree';
import ContentList from '../../components/ContentList';
import api from '../../services/api';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Content');
  const [searchTerm, setSearchTerm] = useState('');

  // URL search params ko check karein
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const term = searchParams.get('search');

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
    } else if (term) {
      setSearchTerm(term);
      setSelectedCategoryName(`Search: ${term}`);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategoryName('All Content');
    }
  }, [searchParams]);

  const handleCategorySelect = (id, name) => {
    setSearchParams({ category: id });
    setSearchTerm(''); 
  };

  const handleSearch = (term) => {
    setSearchParams({ search: term });
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
             <h2 className="fw-bold mb-0 text-dark">{selectedCategoryName}</h2>
          </div>
          
          {/* Content ko yahaan render karein */}
          <ContentList 
            categoryId={selectedCategoryId} 
            searchTerm={searchTerm} 
          />

        </main>
      </div>
    </div>
  );
}
