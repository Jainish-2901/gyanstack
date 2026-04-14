import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import LoadingScreen from './LoadingScreen'; 
function CategoryItem({ category, onSelect, activeCategoryId }) {
  const [isOpen, setIsOpen] = useState(true); 

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(category._id, category.name);
  };
  
  const hasChildren = category.children && category.children.length > 0;
  const isActive = activeCategoryId === category._id;
  
  return (
    <div className="list-group-item list-group-item-action p-0 border-0">
      <div 
        onClick={handleClick}
        className={`d-flex justify-content-between align-items-center p-3 rounded ${isActive ? 'active shadow-sm' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <span>
          <i 
             className={`bi ${isOpen ? 'bi-folder2-open' : 'bi-folder'} me-2`}
             onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          ></i>
          {category.name}
        </span>
        {hasChildren && (
            <i 
              className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`}
              onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            ></i>
        )}
      </div>

      {/* Sub-categories (Recursive) */}
      {isOpen && hasChildren && (
        <div className="list-group ps-4 border-start ms-3">
          {category.children.map(subCat => ( 
            <CategoryItem 
              key={subCat._id} 
              category={subCat} 
              onSelect={onSelect}
              activeCategoryId={activeCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({ onCategorySelect }) {
  const [nestedCategories, setNestedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const { data } = await api.get('/categories/all-nested'); 
        
        const categoriesList = data.categories || data; 
        setNestedCategories(categoriesList);
        
        setActiveCategoryId('root');
        onCategorySelect('root', 'All Content'); 

      } catch (error) {
        console.error("Error fetching all nested categories:", error);
      }
      setLoading(false);
    };
    fetchAllCategories();
  }, []);

  const handleSelect = (id, name) => {
    setActiveCategoryId(id);
    onCategorySelect(id, name);
  };

  if (loading) {
    return <LoadingScreen text="Loading categories..." />;
  }

  return (
    <div className="list-group">
      <div 
        className={`list-group-item list-group-item-action p-3 fw-bold rounded mb-2 ${activeCategoryId === 'root' ? 'active shadow-sm' : ''}`}
        onClick={() => handleSelect('root', 'All Content')}
        style={{ cursor: 'pointer' }}
      >
        <i className="bi bi-diagram-3-fill me-2"></i> All Content
      </div>
      
      {nestedCategories.map(category => (
        <CategoryItem 
          key={category._id} 
          category={category} 
          onSelect={handleSelect}
          activeCategoryId={activeCategoryId}
        />
      ))}
    </div>
  );
}