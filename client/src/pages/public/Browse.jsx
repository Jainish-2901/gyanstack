import React, { useState } from 'react';
import SearchBar from '../../components/SearchBar';
import CategoryTree from '../../components/CategoryTree';
import ContentList from '../../components/ContentList';

export default function Browse() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('All Content');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategorySelect = (id, name) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
    setSearchTerm(''); // Search ko reset karein
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSelectedCategoryId(null); // Category selection ko reset karein
    setSelectedCategoryName(`Search results for "${term}"`);
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
