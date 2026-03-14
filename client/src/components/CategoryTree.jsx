import React, { useState, useEffect } from 'react';
// Ab yeh MongoDB API se categories fetch karega
import api from '../services/api'; // FIX: ../services/api
import LoadingScreen from './LoadingScreen'; // FIX: ./LoadingScreen (Same folder me hone ki ummeed)

// Yeh ek recursive component hai jo categories aur sub-categories dikhayega
function CategoryItem({ category, onSelect, activeCategoryId }) {
  // FIX: Start with categories collapsed by default for a cleaner UI
  const [isOpen, setIsOpen] = useState(false); 

  // Auto-expand if active category is this or a child of this
  useEffect(() => {
    const isChildActive = (cat) => {
        if (cat._id === activeCategoryId) return true;
        if (cat.children) {
            return cat.children.some(child => isChildActive(child));
        }
        return false;
    };

    if (activeCategoryId && isChildActive(category)) {
        setIsOpen(true);
    }
  }, [activeCategoryId, category]);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(category._id, category.name); 
  };
  
  // FIX 5: children se check karein
  const hasChildren = category.children && category.children.length > 0;
  const isActive = activeCategoryId === category._id;
  
  // Naye feature: Click karne par Category filter ho, lekin Content collapse na ho
  
  return (
    <div className="list-group-item list-group-item-action p-0 border-0">
      <div 
        onClick={handleClick}
        className={`d-flex justify-content-between align-items-center p-3 rounded ${isActive ? 'active shadow-sm' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        <span>
          {/* Toggle Icon ab sirf visual hai, click event hataya gaya */}
          <i 
             className={`bi ${isOpen ? 'bi-folder2-open' : 'bi-folder'} me-2`}
             // FIX 6: Click karne par toggle ho, lekin selection ko disturb na kare
             onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          ></i>
          {category.name}
        </span>
        {/* Chevron icon ko children ke basis par dikhayein */}
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
          {category.children.map(subCat => ( // FIX 7: children array ka upyog karein
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

// Main component jo root categories ko load karta hai
export default function CategoryTree({ onCategorySelect }) {
  // FIX 8: Ab nested structure store karein
  const [nestedCategories, setNestedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        // FIX 9: /all-nested route ko call karein
        // Note: is route se pura tree structure (children ke saath) aata hai
        const { data } = await api.get('/categories/all-nested'); 
        
        // Agar data {categories: [...]} format me hai
        const categoriesList = data.categories || data; 
        setNestedCategories(categoriesList);
        
        // FIX 10: Default 'All Content' (root) select karein
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
      {/* Root level ko manually add karein */}
      <div 
        className={`list-group-item list-group-item-action p-3 fw-bold rounded mb-2 ${activeCategoryId === 'root' ? 'active shadow-sm' : ''}`}
        onClick={() => handleSelect('root', 'All Content')}
        style={{ cursor: 'pointer' }}
      >
        <i className="bi bi-diagram-3-fill me-2"></i> All Content
      </div>
      
      {/* Nested Categories */}
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