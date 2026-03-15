import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 fade-in">
      <div className="fancy-search d-flex align-items-center">
        <i className="bi bi-search ms-4 text-muted fs-4"></i>
        <input
          type="search"
          className="form-control flex-grow-1"
          placeholder="Search for notes, videos, tags (e.g., 'IMP')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary btn-lg d-flex align-items-center gap-2" type="submit">
          <i className="bi bi-search"></i>
        </button>
      </div>
    </form>
  );
}