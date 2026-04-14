import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAdminCategories, useAllCategoriesFlat, useCategoryMutation } from '../hooks/useAdminCategories';

const EditCategoryForm = ({ category, allCategories, onSave, onCancel }) => {
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState(category.parentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(category._id, name, parentId);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-bottom bg-primary bg-opacity-5">
      <div className="mb-2">
        <label className="form-label small fw-bold">Update Name</label>
        <input 
          type="text" 
          className="form-control form-control-sm" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          autoFocus 
        />
      </div>
      <div className="mb-2">
        <label className="form-label small fw-bold">Move to Parent</label>
        <select 
          className="form-select form-select-sm" 
          value={parentId} 
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="root">-- Root (Main Category) --</option>
          {allCategories.filter(c => c._id !== category._id).map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-sm btn-success flex-grow-1 d-flex align-items-center justify-content-center">
            <i className="bi bi-check-lg me-1"></i> Save
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" onClick={onCancel}>
            <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </form>
  );
};

const CategoryItem = ({ category, index, allCategories, onSelect, selectedId, onDelete, onUpdate, isSelectOnly, reorderAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Use TanStack Query for sub-categories
  const { data: subCategories = [], isLoading: loadingSubs } = useAdminCategories(category._id);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const isSelected = selectedId === category._id;

  const handleSaveEdit = (id, newName, newParentId) => {
    onUpdate({ id, name: newName, parentId: newParentId });
    setIsEditing(false);
  };
  
  const onSubDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newSubs = Array.from(subCategories);
    const [reorderedItem] = newSubs.splice(source.index, 1);
    newSubs.splice(destination.index, 0, reorderedItem);

    const orderedData = newSubs.map((item, idx) => ({ _id: item._id, order: idx }));
    reorderAction({ orderedCategories: orderedData, parentId: category._id });
  };

  return (
    <Draggable draggableId={category._id} index={index} isDragDisabled={isSelectOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list-group-item p-0 border-0"
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? 'var(--brand-100)' : 'transparent',
            color: 'var(--text-primary)'
          }}
        >
          {isEditing ? (
            <EditCategoryForm 
              category={category} 
              allCategories={allCategories} 
              onSave={handleSaveEdit} 
              onCancel={() => setIsEditing(false)} 
            />
          ) : (
            <div 
              className={`d-flex justify-content-between align-items-center p-2 ps-3 ${isSelected ? 'bg-primary text-white shadow-sm' : ''}`}
              style={{ cursor: 'pointer', borderRadius: '0.75rem', marginBottom: '4px', color: isSelected ? 'white' : 'var(--text-primary)' }}
              onClick={() => onSelect(category)}
            >
              <span className="flex-grow-1 text-break pe-2">
                {!isSelectOnly && (
                  <i className="bi bi-grip-vertical me-2 d-none d-md-inline-block text-muted" {...provided.dragHandleProps}></i>
                )}
                <i 
                  className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 ${isSelected ? 'text-white' : 'text-primary'}`}
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

          {isOpen && (
            <DragDropContext onDragEnd={onSubDragEnd}>
              <div className="list-group ps-2 ps-md-4 border-start ms-2 ms-md-3 overflow-hidden">
                <Droppable droppableId={category._id} type="SUB_CATEGORY">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {loadingSubs ? (
                        <div className="p-2 small text-muted">Loading...</div>
                      ) : subCategories.length > 0 ? (
                        subCategories.map((subCat, subIndex) => (
                          <CategoryItem 
                            key={subCat._id} 
                            category={subCat} 
                            index={subIndex} 
                            allCategories={allCategories}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            isSelectOnly={isSelectOnly}
                            reorderAction={reorderAction}
                          />
                        ))
                      ) : (
                        <span className="list-group-item border-0 ps-3 fst-italic small">No sub-categories</span>
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

export default function CategoryManager({ onSelectCategory, isSelectOnly = false }) {
  const [newCatName, setNewCatName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ _id: 'root', name: 'Root' });

  // Use TanStack Query hooks
  const { data: rootCategories = [], isLoading: loadingRoots } = useAdminCategories('root');
  const { data: allCategoriesFlattened = [] } = useAllCategoriesFlat();
  const { createCategory, updateCategory, deleteCategory, reorderCategories } = useCategoryMutation();

  // Create
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    
    createCategory.mutate({
      name: newCatName,
      parentId: selectedCategory._id,
      order: selectedCategory._id === 'root' ? rootCategories.length : 0,
    }, {
      onSuccess: () => setNewCatName(''),
    });
  };

  // Reorder
  const onRootDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newRoots = Array.from(rootCategories);
    const [reorderedItem] = newRoots.splice(source.index, 1);
    newRoots.splice(destination.index, 0, reorderedItem);

    const orderedData = newRoots.map((item, idx) => ({ _id: item._id, order: idx }));
    reorderCategories.mutate({ orderedCategories: orderedData, parentId: 'root' });
  };

  const handleSelect = (category) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category._id, category.name);
    }
  };

  return (
    <div className="glass-card shadow-sm border-0">
      <div className="card-body">
        {!isSelectOnly && (
          <>
            <h5 className="card-title fw-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Manage Categories</h5>
            <form onSubmit={handleCreateCategory} className="mb-3">
              <label className="form-label small text-muted">Creating in: <span className="fw-bold text-primary">{selectedCategory.name}</span></label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="New Category Name..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <button className="btn btn-primary px-3" type="submit" disabled={createCategory.isPending}>
                    {createCategory.isPending ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-plus-lg fw-bold"></i>}
                </button>
              </div>
            </form>
          </>
        )}
        
        <DragDropContext onDragEnd={onRootDragEnd}>
          <div className="list-group category-tree" style={{ maxHeight: '450px', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
            <div 
              className={`d-flex align-items-center p-2 ps-3 fw-bold rounded-3 mb-2 transition-all ${selectedCategory._id === 'root' ? 'bg-primary text-white shadow-sm' : 'hover-bg-light'}`}
              style={{ cursor: 'pointer', color: selectedCategory._id === 'root' ? 'white' : 'var(--text-primary)' }}
              onClick={() => handleSelect({ _id: 'root', name: 'Root' })}
            >
              <i className={`bi bi-diagram-3-fill me-2 ${selectedCategory._id === 'root' ? 'text-white' : 'text-primary'}`}></i> Root
            </div>
            
            {loadingRoots ? ( <p className="p-3 text-center">Loading tree...</p> ) : (
              <Droppable droppableId="root" type="ROOT_CATEGORY">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {rootCategories.map((category, index) => (
                      <CategoryItem 
                        key={category._id} 
                        category={category} 
                        index={index} 
                        allCategories={allCategoriesFlattened}
                        onSelect={handleSelect}
                        selectedId={selectedCategory._id}
                        onDelete={(id) => deleteCategory.mutate(id)}
                        onUpdate={(data) => updateCategory.mutate(data)}
                        isSelectOnly={isSelectOnly}
                        reorderAction={(data) => reorderCategories.mutate(data)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}