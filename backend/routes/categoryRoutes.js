const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getCategories, 
  deleteCategory, 
  updateCategory, 
  reorderCategories,
  getAllNestedCategories 
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware'); 

// POST /api/categories
router.post('/', authMiddleware, adminMiddleware, createCategory);

// GET /api/categories?parentId=...
router.get('/', getCategories); 

// --- NAYA ROUTE ---
// AdminPanel me category map banane ke liye
router.get('/all-nested', getAllNestedCategories);
// -----------------

// --- NAYA ROUTE ---
// PUT /api/categories/:id (Category ka naam update karne ke liye)
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
// -----------------

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

// PATCH /api/categories/reorder
router.patch('/reorder', authMiddleware, adminMiddleware, reorderCategories);

module.exports = router;