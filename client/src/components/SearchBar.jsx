import React, { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, initialValue = '', placeholder = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar-wrapper mb-3 fade-in w-100">
      <form onSubmit={handleSubmit} className="w-100">
        <div className="search-glass-container d-flex align-items-center px-3 py-1 rounded-pill shadow-sm">

          {/* Search Icon */}
          <div className="ms-1 me-2">
            <i className="bi bi-search text-primary" style={{ fontSize: '1rem' }}></i>
          </div>

          {/* Borderless Input - Full Width */}
          <input
            type="text"
            className="form-control border-0 bg-transparent shadow-none py-2"
            placeholder={placeholder || "Search across all academic resources or use @username..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              fontSize: '1rem',
              fontWeight: '400',
              outline: 'none'
            }}
          />

          {/* Actions */}
          <div className="d-flex align-items-center gap-2 pe-1">
            {searchTerm && (
              <button
                type="button"
                className="btn btn-link text-muted p-0 me-1 border-0 shadow-none"
                onClick={handleClear}
              >
                <i className="bi bi-x-lg" style={{ fontSize: '0.9rem' }}></i>
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 py-1 fw-bold shadow-sm"
              style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              <span className="d-none d-md-inline">Search</span>
              <i className="bi bi-arrow-right d-md-none"></i>
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .search-glass-container {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          transition: all 0.25s ease-in-out;
          width: 100%;
        }

        .search-glass-container:focus-within {
          background: var(--surface-color);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15) !important;
          border-color: var(--primary);
        }

        /* Clean up standard search input behavior */
        input::-webkit-search-decoration,
        input::-webkit-search-cancel-button,
        input::-webkit-search-results-button,
        input::-webkit-search-results-decoration {
          display: none;
        }

        input::placeholder {
          color: #94a3b8;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}