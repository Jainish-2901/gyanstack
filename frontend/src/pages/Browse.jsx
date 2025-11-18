import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryTree from '../components/CategoryTree';
import ContentList from '../components/ContentList';

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
    <div className="container-fluid fade-in">
      <div className="row g-4">
        {/* Sidebar: Categories */}
        <aside className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0 fw-bold">Categories</h5>
            </div>
            <div className="card-body">
              {/* onCategorySelect props pass karein */}
              <CategoryTree onCategorySelect={handleCategorySelect} /> 
            </div>
          </div>
        </aside>

        {/* Main Content: Search + List */}
        <main className="col-lg-9">
          <SearchBar onSearch={handleSearch} />
          <h2 className="fw-bold mb-4 text-primary">{selectedCategoryName}</h2>
          
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