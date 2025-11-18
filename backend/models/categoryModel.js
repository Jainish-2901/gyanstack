const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  parentId: {
    type: String, // 'root' ya fir parent category ki ID
    required: true,
    default: 'root', // Default parent 'root' hai
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: Number,
    default: 0, // Drag-and-drop ke liye order
  },
}, { timestamps: true }); // createdAt aur updatedAt automatic add karega

// Ensure karein ki ek parent ke andar duplicate naam na ho
categorySchema.index({ name: 1, parentId: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;