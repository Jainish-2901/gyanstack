const Category = require('../models/categoryModel'); // Apne model ka path check karein
const Content = require('../models/contentModel');
const { updateDriveFile } = require('../utils/googleDrive');

// --- RECURSIVE CHECK HELPER ---
const isDescendantOf = async (targetParentId, categoryId) => {
  if (targetParentId === categoryId) return true;
  if (!targetParentId || targetParentId === 'root') return false;

  const parent = await Category.findById(targetParentId);
  if (!parent || !parent.parentId || parent.parentId === 'root') return false;
  
  return await isDescendantOf(parent.parentId, categoryId);
};

// --- NAYA HELPER FUNCTION ---
// --- Sabhi nested categories ko fetch karne ke liye (Optimized for Vercel) ---
const fetchNestedCategories = async (parentId, depth = 0) => {
  // Infinite recursion safety check
  if (depth > 12) return [];

  // parentId 'root' ya ek valid ID ho sakta hai
  const categories = await Category.find({ parentId: parentId.toString() }).sort({ order: 1 });
  
  let categoryList = [];
  
  for (let category of categories) {
    const categoryObj = category.toObject();
    
    // Get count of items specifically in this category
    const itemCount = await Content.countDocuments({ categoryId: categoryObj._id.toString() });
    categoryObj.itemCount = itemCount;

    // Recursive call to get children with depth increment
    const children = await fetchNestedCategories(categoryObj._id.toString(), depth + 1);
    if (children.length > 0) {
      categoryObj.children = children;
    }
    categoryList.push(categoryObj);
  }
  
  return categoryList;
};
// -----------------------------


// --- YEH NAYA FUNCTION HAI ---
// 1. Nayi Category Banana
exports.createCategory = async (req, res) => {
  const { name, parentId, order } = req.body;
  try {
    // Check karein ki same parent ke andar duplicate naam na ho
    const existingCategory = await Category.findOne({ name, parentId });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists at this level.' });
    }
    
    const newCategory = new Category({
      name,
      parentId,
      order: order || 0, // Default order
      createdBy: req.user.id // <-- ZAROORI CHANGE
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (createCategory)');
  }
};

// --- YEH NAYA FUNCTION HAI ---
// 2. Categories Lena (Sirf ek level, ?parentId=... ke hisaab se)
exports.getCategories = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) {
      return res.status(400).json({ message: 'parentId query is required' });
    }
    
    const categories = await Category.find({ parentId }).sort({ order: 1 });
    res.json({ categories });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (getCategories)');
  }
};

// --- YEH NAYA FUNCTION HAI ---
// 3. Category Update Karna (Naam)
exports.updateCategory = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // --- PARENT UPDATED (MOVE LOGIC) ---
    if (parentId && parentId !== category.parentId) {
      // Infinite recursion safety: check if parentId is a descendant of current category
      const isRecursive = await isDescendantOf(parentId, req.params.id);
      if (isRecursive) {
        return res.status(400).json({ message: 'Cannot move a category into itself or its own sub-categories.' });
      }
      
      // Update order to end of new parent list
      const count = await Category.countDocuments({ parentId });
      category.order = count;
      category.parentId = parentId;
    }

    const oldName = category.name;
    if (name) {
      // Check for duplicate name in same level
      const existingCategory = await Category.findOne({ 
        name, 
        parentId: category.parentId, 
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Another category with this name already exists at this level.' });
      }
      category.name = name;
    }
    
    await category.save();

    // drive sync...
    if (category.googleDriveFolderId && name && oldName !== name) {
      try {
        await updateDriveFile(category.googleDriveFolderId, name);
      } catch (driveErr) {
        console.error("Drive Rename Failed:", driveErr.message);
      }
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (updateCategory)');
  }
};

// --- YEH NAYA FUNCTION HAI ---
// 4. Category Delete Karna
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check karein ki iske child categories to nahi hain
    const children = await Category.countDocuments({ parentId: req.params.id });
    if (children > 0) {
      return res.status(400).json({ message: 'Cannot delete. This category has sub-categories.' });
    }
    
    // Check karein ki is category mein koi content to nahi hai
    if (!Content) {
        var Content = require('../models/contentModel');
    }
    const contentCount = await Content.countDocuments({ categoryId: req.params.id });
    if (contentCount > 0) {
      return res.status(400).json({ message: 'Cannot delete. This category has linked content. Please move or delete content first.' });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (deleteCategory)');
  }
};


// --- YEH NAYA FUNCTION HAI ---
// 5. Sabhi Nested Categories Lena (AdminPanel Map ke liye)
exports.getAllNestedCategories = async (req, res) => {
  try {
    if (!Category) {
        throw new Error('Category model is not registered properly');
    }
    const categories = await fetchNestedCategories('root');
    res.json({ categories });
  } catch (err) {
    console.error("CRITICAL Nested Categories Error:", err);
    res.status(500).json({ 
        success: false,
        message: 'Server Error while fetching nested categories',
        error: process.env.NODE_ENV === 'production' ? 'Recursive Fetch Failure' : err.message
    });
  }
};
// -----------------------------


// --- YEH FUNCTION AAPKE PAAS PEHLE SE THA ---
// 6. Categories Reorder Karna
exports.reorderCategories = async (req, res) => {
  try {
    const { orderedCategories } = req.body;

    if (!orderedCategories || !Array.isArray(orderedCategories)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const mongoose = require('mongoose');

    // Mongoose raw bulkWrite doesn't always cast _id strings to ObjectIds
    const bulkOps = orderedCategories.map(item => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item._id) },
        update: { $set: { order: item.order } }
      }
    }));

    await Category.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Categories reordered successfully' });

  } catch (err) {
    console.error("CRITICAL Reorder Error:", err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error during reorder',
      error: process.env.NODE_ENV === 'production' ? err.message : err.stack 
    });
  }
};
// -----------------------------