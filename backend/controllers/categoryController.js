const Category = require('../models/categoryModel'); // Apne model ka path check karein

// --- NAYA HELPER FUNCTION ---
// Sabhi nested categories ko fetch karne ke liye
const fetchNestedCategories = async (parentId) => {
  // parentId 'root' ya ek valid ID ho sakta hai
  const categories = await Category.find({ parentId }).sort({ order: 1 });
  
  let categoryList = [];
  
  for (let category of categories) {
    // toObject() zaroori hai taaki hum 'children' add kar sakein
    const categoryObj = category.toObject();
    
    // Recursive call
    const children = await fetchNestedCategories(categoryObj._id);
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
  const { name } = req.body;
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check karein ki naya naam duplicate na ho
    const existingCategory = await Category.findOne({ 
      name, 
      parentId: category.parentId, 
      _id: { $ne: req.params.id } // Khud ko chhodkar
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Another category with this name already exists at this level.' });
    }
    
    category.name = name;
    await category.save();
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
    
    // TODO: Check karein ki is category mein koi content to nahi hai
    // const contentCount = await Content.countDocuments({ categoryId: req.params.id });
    // if (contentCount > 0) {
    //   return res.status(400).json({ message: 'Cannot delete. This category has content in it.' });
    // }
    
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
    const categories = await fetchNestedCategories('root');
    res.json({ categories });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (getAllNestedCategories)');
  }
};
// -----------------------------


// --- YEH FUNCTION AAPKE PAAS PEHLE SE THA ---
// 6. Categories Reorder Karna
exports.reorderCategories = async (req, res) => {
  try {
    // Frontend se naye order wali list aayegi
    const { orderedCategories } = req.body;

    if (!orderedCategories || !Array.isArray(orderedCategories)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Ek saath multiple updates karne ke liye
    const bulkOps = orderedCategories.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: item.order } }
      }
    }));

    // Database me bulk operation chalayein
    await Category.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Categories reordered successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error during reorder');
  }
};
// -----------------------------