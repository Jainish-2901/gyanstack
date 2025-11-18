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
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="input-group input-group-lg shadow-sm">
        <input
          type="search"
          className="form-control"
          placeholder="Search for notes, videos, tags (e.g., 'IMP')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          <i className="bi bi-search me-1"></i> Search
        </button>
      </div>
      {/* TODO: Filters (by type, tags) yahaan add kar sakte hain */}
    </form>
  );
}