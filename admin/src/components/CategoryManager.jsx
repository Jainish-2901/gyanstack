import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Path ko wapas fix kiya gaya hai
// --- NAYE IMPORTS (Library change ho gayi hai) ---
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// -----------------------------------------------

// ... (EditCategoryForm component waisa hi rahega) ...
const EditCategoryForm = ({ category, onSave, onCancel }) => {
  const [name, setName] = useState(category.name);
  const handleSubmit = (e) => { e.preventDefault(); onSave(category._id, name); };
  return (
    <form onSubmit={handleSubmit} className="d-flex w-100 p-2">
      <input type="text" className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <button type="submit" className="btn btn-sm btn-success ms-2"><i className="bi bi-check-lg"></i></button>
      <button type="button" className="btn btn-sm btn-secondary ms-1" onClick={onCancel}><i className="bi bi-x-lg"></i></button>
    </form>
  );
};

// --- CategoryItem Component (Ab Draggable) ---
const CategoryItem = ({ category, index, onSelect, selectedId, onDelete, onUpdate, isSelectOnly }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sub-categories fetch karein (Order ke hisaab se)
  const fetchSubCategories = async () => {
    try {
      const { data } = await api.get(`/categories?parentId=${category._id}`);
      // Sort by 'order' field
      const sortedSubCats = data.categories.sort((a, b) => a.order - b.order);
      setSubCategories(sortedSubCats);
    } catch (error) {
      console.error("Failed to fetch sub-categories", error);
    }
  };

  const handleToggle = () => {
    if (!isOpen) { fetchSubCategories(); }
    setIsOpen(!isOpen);
  };
  
  const isSelected = selectedId === category._id;

  const handleSaveEdit = (id, newName) => {
    onUpdate(id, newName, category.parentId); // ParentID bhi bhejein
    setIsEditing(false);
  };
  
  // --- NAYA FUNCTION: Sub-category Drag End ---
  const onSubDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return; // Drop zone se bahar drop kiya
    if (destination.droppableId === source.droppableId && destination.index === source.index) return; // Jagah change nahi hui

    const newSubCategories = Array.from(subCategories);
    const [reorderedItem] = newSubCategories.splice(source.index, 1);
    newSubCategories.splice(destination.index, 0, reorderedItem);

    // Naye order ke saath array banayein
    const orderedData = newSubCategories.map((item, index) => ({
      _id: item._id,
      order: index
    }));
    
    // UI turant update karein
    setSubCategories(newSubCategories);
    
    // Backend ko call karein
    api.patch('/categories/reorder', { orderedCategories: orderedData })
      .catch(err => {
        console.error("Failed to reorder sub-categories", err);
        // TODO: User ko error dikhayein aur state ko revert karein
      });
  };

  return (
    // Step 3: <Draggable>
    <Draggable draggableId={category._id} index={index} isDragDisabled={isSelectOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list-group-item p-0 border-0"
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? '#e9ecef' : 'transparent',
          }}
        >
          {isEditing ? (
            <EditCategoryForm category={category} onSave={handleSaveEdit} onCancel={() => setIsEditing(false)} />
          ) : (
            <div 
              className={`d-flex justify-content-between align-items-center p-2 ps-3 ${isSelected ? 'bg-primary text-white' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(category)}
            >
              <span>
                {/* Drag Handle */}
                {!isSelectOnly && (
                  <i className="bi bi-grip-vertical me-2" {...provided.dragHandleProps}></i>
                )}
                <i 
                  className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`}
                  onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                ></i>
                {category.name}
              </span>
              
              {!isSelectOnly && (
                <span className="category-actions">
                  <button className={`btn btn-sm ${isSelected ? 'btn-light' : 'btn-outline-secondary'}`} onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                    <i className="bi bi-pencil-fill"></i>
                  </button>
                  <button className={`btn btn-sm ${isSelected ? 'btn-danger' : 'btn-outline-danger'} ms-1`} onClick={(e) => { e.stopPropagation(); onDelete(category._id); }}>
                    <i className="bi bi-trash"></i>
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Sub-categories (Ab ye bhi ek Drag-and-Drop list hai) */}
          {isOpen && (
            // Step 1: <DragDropContext> (Nested)
            <DragDropContext onDragEnd={onSubDragEnd}>
              <div className="list-group ps-4 border-start ms-3">
                {/* Step 2: <Droppable> (Nested) */}
                <Droppable droppableId={category._id} type="SUB_CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {subCategories.length > 0 ? (
                        subCategories.map((subCat, subIndex) => (
                          <CategoryItem 
                            key={subCat._id} 
                            category={subCat} 
                            index={subIndex} // Index zaroori hai
                            onSelect={onSelect}
                            selectedId={selectedId}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            isSelectOnly={isSelectOnly}
                          />
                        ))
                      ) : (
                        <span className="list-group-item list-group-item-action border-0 ps-3 fst-italic small">No sub-categories</span>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          )}
        </div>
      )}
    </Draggable>
  );
};

// --- Updated CategoryManager Component ---
export default function CategoryManager({ onSelectCategory, isSelectOnly = false }) {
  const [rootCategories, setRootCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ _id: 'root', name: 'Root' });
  const [newCatName, setNewCatName] = useState('');

  // Fetch root categories (Order ke hisaab se)
  const fetchRootCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories?parentId=root');
      // Sort by 'order' field
      const sortedCats = data.categories.sort((a, b) => a.order - b.order);
      setRootCategories(sortedCats);
    } catch (err) {
      setError('Failed to load categories.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchRootCategories(); }, []);

  // Create
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    if (!newCatName) return setError('Category name is required.');
    
    // Nayi category ko list ke end me order dein
    const newOrder = selectedCategory._id === 'root' 
      ? rootCategories.length 
      : 0; // TODO: Sub-category length check
      
    try {
      await api.post('/categories', {
        name: newCatName,
        parentId: selectedCategory._id,
        order: newOrder, // Naya order set karein
      });
      setNewCatName('');
      fetchRootCategories(); // TODO: Better state management
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Delete
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchRootCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  // Update
  const handleUpdateCategory = async (id, newName, parentId) => {
    setError('');
    if (!newName) return setError('Category name is required.');
    try {
      await api.put(`/categories/${id}`, { name: newName });
      
      // TODO: State ko locally update karein, na ki poora fetch
      if (parentId === 'root') {
        fetchRootCategories();
      } else {
        // Sub-category ko refresh karna thoda complex hai, abhi ke liye skip
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    }
  };

  // Select
  const handleSelect = (category) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category._id, category.name);
    }
  };

  // --- NAYA FUNCTION: Root Drag End ---
  const onRootDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Naya array banayein (state ko mutate na karein)
    const newRootCategories = Array.from(rootCategories);
    // 2. Item ko purani jagah se hatayein
    const [reorderedItem] = newRootCategories.splice(source.index, 1);
    // 3. Item ko nayi jagah daalein
    newRootCategories.splice(destination.index, 0, reorderedItem);

    // 4. Naye order ke saath data banayein (backend ke liye)
    const orderedData = newRootCategories.map((item, index) => ({
      _id: item._id,
      order: index
    }));
    
    // 5. UI ko turant update karein
    setRootCategories(newRootCategories);
    
    // 6. Backend ko call karke save karein
    api.patch('/categories/reorder', { orderedCategories: orderedData })
      .catch(err => {
        console.error("Failed to reorder root categories", err);
        setError("Failed to save new order. Please refresh.");
        // Error hua to purana state wapas laayein
        fetchRootCategories();
      });
  };

  return (
    <div className="card">
      <div className="card-body">
        {!isSelectOnly && (
          <>
            <h5 className="card-title fw-bold">Manage Categories</h5>
            {error && <div className="alert alert-danger p-2 small">{error}</div>}
            <form onSubmit={handleCreateCategory} className="mb-3">
              <label className="form-label small">Creating in: <span className="fw-bold">{selectedCategory.name}</span></label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="New Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <button className="btn btn-primary" type="submit">+</button>
              </div>
            </form>
          </>
        )}
        
        {/* --- YAHAN DRAG-AND-DROP ADD HUA HAI --- */}
        {/* Step 1: <DragDropContext> */}
        <DragDropContext onDragEnd={onRootDragEnd}>
          <div className="list-group category-tree" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {/* Root level (ye draggable nahi hai) */}
            <div 
              className={`list-group-item list-group-item-action p-2 ps-3 fw-bold ${selectedCategory._id === 'root' ? 'bg-primary text-white' : ''}`}
              onClick={() => handleSelect({ _id: 'root', name: 'Root' })}
            >
              <i className="bi bi-diagram-3-fill me-2"></i> Root
            </div>
            
            {loading ? ( <p>Loading tree...</p> ) : (
              // Step 2: <Droppable>
              <Droppable droppableId="root" type="ROOT_CATEGORY">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {rootCategories.map((category, index) => (
                      <CategoryItem 
                        key={category._id} 
                        category={category} 
                        index={index} // Index zaroori hai
                        onSelect={handleSelect}
                        selectedId={selectedCategory._id}
                        onDelete={handleDeleteCategory}
                        onUpdate={handleUpdateCategory}
                        isSelectOnly={isSelectOnly}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
        {/* --- END OF DRAG-AND-DROP --- */}

      </div>
    </div>
  );
}